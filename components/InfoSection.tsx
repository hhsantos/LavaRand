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
        Cryptography and Chaos
      </h2>
      <div className="flex flex-col">
        <AccordionItem 
            title="Why Use Lava Lamps?" 
            isOpen={openIndex === 0} 
            onClick={() => toggle(0)}
        >
            Computers are logical and predictable by design, which is bad for security. A lava lamp is a chaotic physical system. The "lava" never takes the same shape twice. Cloudflare photographs a wall of 100 lamps to capture this unpredictable randomness and use it in encryption keys.
        </AccordionItem>
        
        <AccordionItem 
            title="What is Entropy?" 
            isOpen={openIndex === 1} 
            onClick={() => toggle(1)}
        >
            In cryptography, entropy is the measure of unpredictability. The greater the "disorder" or uncertainty, the harder it is to guess the key. If data has a pattern, it's not secure. Lava lamps, along with people walking in front of them, provide an extremely high source of entropy.
        </AccordionItem>

        <AccordionItem 
            title="CSPRNG vs PRNG?" 
            isOpen={openIndex === 2} 
            onClick={() => toggle(2)}
        >
            A regular PRNG (Pseudo-Random Number Generator) uses a mathematical formula. If you know the initial "seed", you can predict all future numbers.
            <br/><br/>
            A <strong>CSPRNG</strong> (Cryptographically Secure) is more strict. It must pass rigorous statistical tests and be resistant to reverse engineering. It needs a constant source of new, truly random "seeds" (like photos of lava lamps) to remain secure.
        </AccordionItem>

        <AccordionItem 
            title="The Cryptographic Seed" 
            isOpen={openIndex === 3} 
            onClick={() => toggle(3)}
        >
            It's the initial data that feeds the generator. If the seed is predictable, the key will be too. Cloudflare mixes data from lava lamps, pendulum motion (London), and radioactive decay (Singapore) with Linux system data to create seeds that are virtually impossible to replicate.
        </AccordionItem>
      </div>
    </div>
  );
}