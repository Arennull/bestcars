/**
 * Sección de configuración del panel.
 * Perfil de usuario, notificaciones, seguridad e idioma.
 */
import { motion } from "motion/react";
import { User, Bell, Palette, Database, Shield, Globe } from 'lucide-react';

export function SettingsSection() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg text-white">Perfil de Usuario</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Nombre completo</label>
              <input
                type="text"
                defaultValue="Admin Principal"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@autopanel.com"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Rol</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]">
                <option value="admin" className="bg-black">Administrador</option>
                <option value="comercial" className="bg-black">Comercial</option>
                <option value="marketing" className="bg-black">Marketing</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg text-white">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white/90 mb-1">Nuevos leads</p>
                <p className="text-sm text-white/50">Recibir notificación cuando llegue un nuevo lead</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white/90 mb-1">Cambios de precio</p>
                <p className="text-sm text-white/50">Notificar cuando se modifique el precio de un vehículo</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white/90 mb-1">Leads convertidos</p>
                <p className="text-sm text-white/50">Notificar cuando un lead se convierta en venta</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg text-white">Seguridad</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-white/90 transition-all text-left">
              Cambiar contraseña
            </button>
            <button className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-white/90 transition-all text-left">
              Activar autenticación de dos factores
            </button>
            <button className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-white/90 transition-all text-left">
              Ver sesiones activas
            </button>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg text-white">Idioma y Región</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Idioma</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]">
                <option value="es" className="bg-black">Español</option>
                <option value="en" className="bg-black">English</option>
                <option value="fr" className="bg-black">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Zona horaria</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]">
                <option value="europe/madrid" className="bg-black">Europe/Madrid (GMT+1)</option>
                <option value="europe/london" className="bg-black">Europe/London (GMT+0)</option>
                <option value="america/new_york" className="bg-black">America/New York (GMT-5)</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
