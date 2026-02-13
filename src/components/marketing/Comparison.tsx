"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"

export function Comparison() {
  const steps = [
    { name: "Purchasing local virtual machine", time: "15 min" },
    { name: "Creating SSH keys and storing securely", time: "10 min" },
    { name: "Connecting to the server via SSH", time: "5 min" },
    { name: "Installing Node.js and NPM", time: "5 min" },
    { name: "Installing OpenClaw", time: "7 min" },
    { name: "Setting up OpenClaw", time: "10 min" },
    { name: "Connecting to AI provider", time: "4 min" },
    { name: "Pairing with Telegram", time: "4 min" },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-semibold text-orange-500 tracking-wider uppercase mb-3">
              Comparison
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Traditional Method vs SimpleClaw
            </h3>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start max-w-5xl mx-auto">
          {/* Traditional Way */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="space-y-8"
          >
            <h4 className="text-xl font-medium text-white/60 italic">
              Traditional
            </h4>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex justify-between items-center text-sm group">
                  <span className="text-white/40 group-hover:text-white/60 transition-colors">
                    {step.name}
                  </span>
                  <span className="text-white/60 font-mono">
                    {step.time}
                  </span>
                </div>
              ))}

              <div className="h-px bg-white/10 my-6" />

              <div className="flex justify-between items-center font-bold">
                <span className="text-white">Total</span>
                <span className="text-white text-lg">60 min</span>
              </div>
            </div>

            <p className="text-sm text-white/40 italic">
              If you&apos;re <span className="text-orange-500 font-semibold">non&lsquo;technical</span>, multiply these <span className="text-orange-500 font-semibold">times by 10</span> — you have to learn each step before doing.
            </p>
          </motion.div>

          {/* SimpleClaw Way */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-2xl" />
            <div className="relative space-y-8 p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h4 className="text-xl font-medium text-white italic">
                SimpleClaw
              </h4>

              <div className="space-y-2">
                <div className="text-6xl md:text-7xl font-bold text-white tracking-tighter">
                  &lt;1 min
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Pick a model, connect Telegram, deploy — done under 1 minute.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex gap-3 text-sm text-white/40 leading-relaxed">
                  <div className="mt-1">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p>
                    Servers, SSH and OpenClaw Environment are already set up, waiting to get assigned. Simple, secure and fast connection to your bot.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
