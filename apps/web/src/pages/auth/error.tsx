import Link from "next/link";
import { useRouter } from "next/router";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const errorMessages: Record<string, string> = {
    Configuration: "服务器配置错误，请联系管理员",
    AccessDenied: "访问被拒绝",
    Verification: "验证链接已过期或已使用",
    Default: "登录过程中发生错误",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-text-primary mb-4">登录失败</h1>
        <p className="text-text-secondary mb-8">
          {errorMessages[error as string] || errorMessages.Default}
        </p>
        {error === "Configuration" && (
          <div className="text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 max-w-md">
            <p className="text-red-400 text-sm">可能的原因：</p>
            <ul className="text-red-400 text-sm list-disc list-inside mt-2">
              <li>GitHub Client ID 未配置</li>
              <li>GitHub Client Secret 未配置</li>
              <li>NEXTAUTH_SECRET 未配置</li>
              <li>NEXTAUTH_URL 配置错误</li>
            </ul>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-neon-cyan text-void-primary font-semibold hover:bg-neon-cyan/80 transition-colors"
          >
            返回首页
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-neon-cyan text-neon-cyan font-semibold hover:bg-neon-cyan/10 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    </div>
  );
}
