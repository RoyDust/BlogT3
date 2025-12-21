import qiniu from "qiniu";

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY ?? "";
const secretKey = process.env.QINIU_SECRET_KEY ?? "";
const bucket = process.env.QINIU_BUCKET ?? "";
const domain = process.env.QINIU_DOMAIN ?? "";

// 检查配置是否完整
const isConfigured = accessKey && secretKey && bucket && domain;

if (!isConfigured) {
  console.warn("⚠️ 七牛云配置缺失，图片上传功能将不可用");
  console.warn("请在 .env 文件中配置以下环境变量：");
  if (!accessKey) console.warn("  - QINIU_ACCESS_KEY");
  if (!secretKey) console.warn("  - QINIU_SECRET_KEY");
  if (!bucket) console.warn("  - QINIU_BUCKET");
  if (!domain) console.warn("  - QINIU_DOMAIN");
}

// 创建鉴权对象（只在配置完整时创建）
let mac: qiniu.auth.digest.Mac | undefined;
let config: qiniu.conf.Config | undefined;

if (isConfigured) {
  mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  config = new qiniu.conf.Config({
    zone: qiniu.zone.Zone_z2, // 华南区，根据你的存储区域调整
  });
}

// 生成上传凭证
export function generateUploadToken(key?: string) {
  if (!isConfigured || !mac) {
    throw new Error("七牛云配置未完成，无法生成上传凭证");
  }

  const options = {
    scope: key ? `${bucket}:${key}` : bucket,
    expires: 3600, // 1小时有效期
  };

  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
}

// 上传文件到七牛云
export async function uploadToQiniu(
  file: Buffer,
  key: string,
): Promise<{ url: string; key: string }> {
  if (!isConfigured || !config) {
    throw new Error("七牛云配置未完成，无法上传文件");
  }

  return new Promise((resolve, reject) => {
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    const uploadToken = generateUploadToken(key);

    formUploader.put(uploadToken, key, file, putExtra, (err, body, info) => {
      if (err) {
        console.error("七牛云上传错误:", err);
        reject(err);
        return;
      }

      if (info.statusCode === 200) {
        // 确保域名格式正确
        let baseUrl = domain.endsWith("/") ? domain.slice(0, -1) : domain;
        // 将 HTTPS 转换为 HTTP
        baseUrl = baseUrl.replace(/^https:\/\//i, "http://");
        const fileUrl = `${baseUrl}/${body.key}`;

        resolve({
          url: fileUrl,
          key: body.key,
        });
      } else {
        console.error("七牛云上传失败:", {
          statusCode: info.statusCode,
          data: info.data,
        });
        reject(new Error(`上传失败: HTTP ${info.statusCode}`));
      }
    });
  });
}

// 删除七牛云文件
export async function deleteFromQiniu(key: string): Promise<void> {
  if (!isConfigured || !mac || !config) {
    throw new Error("七牛云配置未完成，无法删除文件");
  }

  return new Promise((resolve, reject) => {
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
      if (err) {
        reject(err);
        return;
      }

      if (respInfo.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`删除失败: ${respInfo.statusCode}`));
      }
    });
  });
}

// 获取文件信息
export async function getFileInfo(key: string) {
  if (!isConfigured || !mac || !config) {
    throw new Error("七牛云配置未完成，无法获取文件信息");
  }

  return new Promise((resolve, reject) => {
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    bucketManager.stat(bucket, key, (err, respBody, respInfo) => {
      if (err) {
        reject(err);
        return;
      }

      if (respInfo.statusCode === 200) {
        resolve(respBody);
      } else {
        reject(new Error(`获取文件信息失败: ${respInfo.statusCode}`));
      }
    });
  });
}

export { mac, config, bucket, domain, isConfigured };
