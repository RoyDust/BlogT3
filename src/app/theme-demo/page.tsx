'use client';

import React, { useState } from 'react';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { HuePicker } from '~/components/ui/HuePicker';
import { Palette } from 'lucide-react';

export default function ThemeDemoPage() {
  const [showHuePicker, setShowHuePicker] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="card-base !rounded-t-none max-w-[var(--page-width)] mx-auto h-[4.5rem] flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-[var(--primary)]">BlogT3 主题演示</h1>

          <div className="flex items-center gap-2">
            <button
              aria-label="主题色设置"
              className="btn-plain scale-animation rounded-lg h-11 w-11"
              onClick={() => setShowHuePicker(!showHuePicker)}
            >
              <Palette className="h-5 w-5" />
            </button>

            <ThemeSwitch />
          </div>

          <HuePicker isOpen={showHuePicker} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[var(--page-width)] mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <section className="card-base p-8 onload-animation">
            <h2 className="text-3xl font-bold text-90 mb-4">
              欢迎使用 RealBlog 风格主题系统
            </h2>
            <p className="text-75 text-lg leading-relaxed">
              这是一个基于 OKLCH 色彩空间的动态主题系统，支持明暗模式切换和 0-360° 色相调整。
              尝试点击右上角的按钮来切换主题模式或调整主题色！
            </p>
          </section>

          {/* Button Showcase */}
          <section className="card-base p-8 onload-animation" style={{ animationDelay: '50ms' }}>
            <h3 className="text-2xl font-bold text-90 mb-6">按钮样式展示</h3>
            <div className="space-y-6">
              <div>
                <p className="text-75 mb-3 font-medium">Plain 按钮</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="btn-plain scale-animation rounded-lg h-11 px-6">
                    Plain Button
                  </button>
                  <button className="btn-plain scale-animation rounded-lg h-11 px-6">
                    Another Plain
                  </button>
                  <button className="btn-plain scale-animation rounded-lg h-11 px-6">
                    More Options
                  </button>
                </div>
              </div>

              <div>
                <p className="text-75 mb-3 font-medium">Regular 按钮</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="btn-regular scale-animation rounded-lg h-11 px-6">
                    Regular Button
                  </button>
                  <button className="btn-regular scale-animation rounded-lg h-11 px-6">
                    Action Button
                  </button>
                  <button className="btn-regular scale-animation rounded-lg h-11 px-6">
                    Submit Form
                  </button>
                </div>
              </div>

              <div>
                <p className="text-75 mb-3 font-medium">Card 按钮</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="btn-card scale-animation rounded-lg h-11 px-6">
                    Card Button
                  </button>
                  <button className="btn-card scale-animation rounded-lg h-11 px-6">
                    Card Action
                  </button>
                  <button className="btn-card scale-animation rounded-lg h-11 px-6 disabled">
                    Disabled
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Text Opacity Showcase */}
          <section className="card-base p-8 onload-animation" style={{ animationDelay: '100ms' }}>
            <h3 className="text-2xl font-bold text-90 mb-6">文字不透明度</h3>
            <div className="space-y-2">
              <p className="text-90 text-lg">文字不透明度 90% (.text-90)</p>
              <p className="text-75 text-lg">文字不透明度 75% (.text-75)</p>
              <p className="text-50 text-lg">文字不透明度 50% (.text-50)</p>
              <p className="text-30 text-lg">文字不透明度 30% (.text-30)</p>
              <p className="text-25 text-lg">文字不透明度 25% (.text-25)</p>
            </div>
          </section>

          {/* Color Showcase */}
          <section className="card-base p-8 onload-animation" style={{ animationDelay: '150ms' }}>
            <h3 className="text-2xl font-bold text-90 mb-6">主题色展示</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-[var(--primary)] mb-2" />
                <p className="text-75 text-sm">Primary</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-[var(--btn-regular-bg)] mb-2" />
                <p className="text-75 text-sm">Regular BG</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-[var(--btn-content)] mb-2" />
                <p className="text-75 text-sm">Button Content</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-[var(--card-bg)] border-2 border-[var(--line-color)] mb-2" />
                <p className="text-75 text-sm">Card BG</p>
              </div>
            </div>
          </section>

          {/* Link Showcase */}
          <section className="card-base p-8 onload-animation" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold text-90 mb-6">链接样式</h3>
            <div className="space-y-4">
              <p className="text-75">
                这是一个包含{' '}
                <a href="#" className="link-underline text-[var(--primary)]">
                  下划线链接
                </a>{' '}
                的段落，悬停时会有动画效果。
              </p>
              <div className="flex gap-4">
                <a href="#" className="link text-75">
                  Expand Link
                </a>
                <a href="#" className="link-lg text-75">
                  Large Expand Link
                </a>
              </div>
            </div>
          </section>

          {/* Instructions */}
          <section className="card-base p-8 onload-animation" style={{ animationDelay: '250ms' }}>
            <h3 className="text-2xl font-bold text-90 mb-6">使用说明</h3>
            <div className="space-y-4 text-75">
              <div>
                <p className="font-medium text-90 mb-2">🌓 切换明暗模式</p>
                <p>点击右上角的太阳/月亮图标，可以在浅色、深色和自动模式之间切换。</p>
              </div>
              <div>
                <p className="font-medium text-90 mb-2">🎨 调整主题色</p>
                <p>
                  点击调色板图标，使用彩虹滑块调整主题色相（0-360°）。所有颜色都会实时更新！
                </p>
              </div>
              <div>
                <p className="font-medium text-90 mb-2">💾 自动保存</p>
                <p>您的主题偏好会自动保存到浏览器本地存储，下次访问时会自动恢复。</p>
              </div>
              <div>
                <p className="font-medium text-90 mb-2">🔄 重置主题</p>
                <p>在色相选择器中，点击重置按钮可以恢复默认的 Hue 250（紫蓝色）。</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[var(--page-width)] mx-auto px-6 py-12 text-center">
        <p className="text-50">
          基于 RealBlog (Fuwari Theme) 设计系统 · BlogT3 项目
        </p>
      </footer>
    </div>
  );
}
