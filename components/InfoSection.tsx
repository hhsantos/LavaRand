import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const AccordionItem = ({ title, children, isOpen, onClick }: AccordionItemProps) => {
  return (
    <div className="border-b border-zinc-800">
      <button
        className="w-full text-left py-4 px-2 flex justify-between items-center hover:bg-zinc-800/50 transition-colors focus:outline-none"
        onClick={onClick}
      >
        <span className="font-semibold text-zinc-200">{title}</span>
        <span className={`transform transition-transform duration-200 text-zinc-400 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function InfoSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-gradient-to-b from-orange-500 to-purple-600 rounded-full"></span>
        La Criptografía y el Caos
      </h2>
      <div className="flex flex-col">
        <AccordionItem 
            title="¿Por qué usar Lámparas de Lava?" 
            isOpen={openIndex === 0} 
            onClick={() => toggle(0)}
        >
            Los ordenadores son lógicos y predecibles por diseño, lo cual es malo para la seguridad. Una lámpara de lava es un sistema físico caótico. La "lava" nunca toma la misma forma dos veces. Cloudflare fotografía una pared de 100 lámparas para capturar esta aleatoriedad impredecible y usarla en claves de encriptación.
        </AccordionItem>
        
        <AccordionItem 
            title="¿Qué es la Entropía?" 
            isOpen={openIndex === 1} 
            onClick={() => toggle(1)}
        >
            En criptografía, la entropía es la medida de la imprevisibilidad. Cuanto mayor sea el "desorden" o la incertidumbre, más difícil es adivinar la clave. Si los datos tienen un patrón, no son seguros. Las lámparas de lava, junto con la gente que camina frente a ellas, proporcionan una fuente de entropía extremadamente alta.
        </AccordionItem>

        <AccordionItem 
            title="¿CSPRNG vs PRNG?" 
            isOpen={openIndex === 2} 
            onClick={() => toggle(2)}
        >
            Un PRNG (Generador de Números Pseudoaleatorios) normal usa una fórmula matemática. Si conoces la "semilla" inicial, puedes predecir todos los números futuros.
            <br/><br/>
            Un <strong>CSPRNG</strong> (Criptográficamente Seguro) es más estricto. Debe pasar pruebas estadísticas rigurosas y ser resistente a la ingeniería inversa. Necesita una fuente constante de "semillas" nuevas y verdaderamente aleatorias (como las fotos de las lámparas de lava) para mantenerse seguro.
        </AccordionItem>

        <AccordionItem 
            title="La Semilla Criptográfica" 
            isOpen={openIndex === 3} 
            onClick={() => toggle(3)}
        >
            Es el dato inicial que alimenta al generador. Si la semilla es predecible, la clave también lo será. Cloudflare mezcla datos de las lámparas de lava, movimiento de péndulos (Londres) y desintegración radiactiva (Singapur) con datos del sistema Linux para crear semillas que son prácticamente imposibles de replicar.
        </AccordionItem>
      </div>
    </div>
  );
}