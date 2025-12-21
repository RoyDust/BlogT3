import { NextRequest, NextResponse } from "next/server";
import { uploadToQiniu } from "~/lib/qiniu";
import { nanoid } from "nanoid";

// 检查七牛云配置
function checkQiniuConfig() {
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;
  const domain = process.env.QINIU_DOMAIN;

  const missing = [];
  if (!accessKey) missing.push("QINIU_ACCESS_KEY");
  if (!secretKey) missing.push("QINIU_SECRET_KEY");
  if (!bucket) missing.push("QINIU_BUCKET");
  if (!domain) missing.push("QINIU_DOMAIN");

  if (missing.length > 0) {
    return {
      valid: false,
      message: `七牛云配置缺失：${missing.join(", ")}。请在 .env 文件中配置这些环境变量。`,
    };
  }

  return { valid: true };
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // 检查七牛云配置
    const configCheck = checkQiniuConfig();
    if (!configCheck.valid) {
      console.error("七牛云配置错误:", configCheck.message);
      return NextResponse.json(
        { error: configCheck.message },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "未找到文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，仅支持 JPG、PNG、GIF、WebP" },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件大小超过限制（最大 10MB）" },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const ext = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomId = nanoid(8);
    const key = `blog/${timestamp}-${randomId}.${ext}`;

    // 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到七牛云
    const result = await uploadToQiniu(buffer, key);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("图片上传失败:", error);

    // 提供更详细的错误信息
    let errorMessage = "上传失败，请重试";
    if (error instanceof Error) {
      errorMessage = error.message;

      // 针对常见错误提供友好提示
      if (errorMessage.includes("unauthorized")) {
        errorMessage = "七牛云认证失败，请检查 AccessKey 和 SecretKey 是否正确";
      } else if (errorMessage.includes("bucket")) {
        errorMessage = "存储空间配置错误，请检查 QINIU_BUCKET 是否正确";
      } else if (errorMessage.includes("domain")) {
        errorMessage = "域名配置错误，请检查 QINIU_DOMAIN 是否正确";
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// 获取上传凭证（用于客户端直传）
export async function GET() {
  try {
    // 检查七牛云配置
    const configCheck = checkQiniuConfig();
    if (!configCheck.valid) {
      return NextResponse.json(
        { error: configCheck.message },
        { status: 500 }
      );
    }

    const { generateUploadToken } = await import("~/lib/qiniu");
    const token = generateUploadToken();

    return NextResponse.json({
      success: true,
      token,
      domain: process.env.QINIU_DOMAIN,
    });
  } catch (error) {
    console.error("获取上传凭证失败:", error);
    return NextResponse.json(
      { error: "获取上传凭证失败" },
      { status: 500 }
    );
  }
}
