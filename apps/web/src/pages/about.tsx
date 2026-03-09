import { motion } from "framer-motion";
import {
  Code2,
  Coffee,
  Github,
  Globe,
  Heart,
  Mail,
  MapPin,
  Sparkles,
  Terminal,
  Twitter,
  Zap,
} from "lucide-react";
import Link from "next/link";

const skills = [
  { name: "React / Next.js", level: 95, color: "from-blue-500 to-cyan-500" },
  { name: "TypeScript", level: 90, color: "from-blue-600 to-blue-400" },
  { name: "Node.js", level: 85, color: "from-green-600 to-green-400" },
  { name: "Python", level: 75, color: "from-yellow-500 to-yellow-300" },
  { name: "Database", level: 80, color: "from-orange-500 to-red-500" },
  { name: "DevOps", level: 70, color: "from-purple-600 to-pink-500" },
];

const stats = [
  { label: "文章", value: "50+", icon: Globe },
  { label: "项目", value: "20+", icon: Terminal },
  { label: "代码行", value: "100K+", icon: Code2 },
  { label: "咖啡", value: "∞", icon: Coffee },
];

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
];

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-neon-cyan mb-6">
            <Sparkles className="w-4 h-4" />
            关于博客
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary mb-6">
            关于 <span className="text-gradient">VoidCode</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            一个专注于技术分享的个人博客，记录学习历程，分享编程心得
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="p-6 rounded-2xl glass text-center"
              >
                <Icon className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-text-primary">
                  {stat.value}
                </div>
                <div className="text-text-tertiary text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - About */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-display text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-neon-cyan" />
              博客理念
            </h2>
            <div className="space-y-4 text-text-secondary">
              <p>VoidCode（虚空代码）诞生于对技术的热爱和对知识的渴望。</p>
              <p>博客名称「虚空代码」寓意着在代码的虚空中探索无限可能。</p>
              <p>这里涵盖前端开发、后端架构、人工智能、云原生等多个技术领域。</p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-text-secondary">
              <MapPin className="w-4 h-4" />
              <span>Made with love on Earth</span>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-neon-cyan/50 transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column - Skills */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <Code2 className="w-6 h-6 text-neon-purple" />
              技术栈
            </h2>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary">{skill.name}</span>
                    <span className="text-text-tertiary text-sm">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-text-primary/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-text-primary mb-8 text-center">
            博客技术栈
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Next.js", desc: "React Framework" },
              { name: "TypeScript", desc: "Type Safety" },
              { name: "Tailwind", desc: "Styling" },
              { name: "Fastify", desc: "Backend API" },
              { name: "Prisma", desc: "ORM" },
              { name: "PostgreSQL", desc: "Database" },
              { name: "Vercel", desc: "Deployment" },
              { name: "GitHub", desc: "Version Control" },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="p-4 rounded-xl glass text-center"
              >
                <div className="font-semibold text-text-primary">{tech.name}</div>
                <div className="text-text-tertiary text-sm">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="p-8 rounded-2xl glass">
            <Heart className="w-8 h-8 text-neon-pink mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-text-primary mb-2">感谢你的访问</h3>
            <p className="text-text-secondary mb-6">
              如果你对我的文章感兴趣，欢迎订阅 RSS 或通过社交媒体关注我
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-void-primary font-semibold hover:opacity-90 transition-opacity"
              >
                浏览文章
              </Link>
              <a
                href="/rss"
                className="w-full sm:w-auto px-6 py-3 rounded-xl glass border border-border-subtle text-text-primary font-medium hover:border-neon-cyan/50 transition-colors"
              >
                订阅 RSS
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
