import React from 'react';
import { motion } from 'motion/react';
import { FileImage, Plus, Filter, Search } from 'lucide-react';

export function EvidenceGalleryView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <FileImage className="text-emerald-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Galeria de Evidências</h3>
            <p className="text-zinc-500 text-sm">Fotos de aulas, campanhas e planos de ação</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="p-3 bg-zinc-100 rounded-xl text-zinc-600 hover:bg-zinc-200 transition-all"><Filter size={20} /></button>
           <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
              <Plus size={18} />
              Novo Upload
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="group relative aspect-square bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 cursor-pointer"
          >
            <img 
              src={`https://picsum.photos/seed/sst-${i}/400/400`} 
              alt="Evidência" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
               <p className="text-white text-[10px] font-bold uppercase">Aula Montagem</p>
               <p className="text-white/70 text-[8px] font-medium">02/03/2026</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
