
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface TacticalChatRoomProps {
  onBack: () => void;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Sgt. Douglas', initials: 'SD', text: 'Viatura 2314 em patrulhamento na Av. Amazonas. Nenhuma alteração até o momento.', time: '09:42', isMe: false, type: 'text' },
  { 
    id: '2', 
    sender: 'Cap. Pereira', 
    initials: 'CP', 
    text: '', 
    time: '09:45', 
    isMe: false, 
    type: 'alert',
    alertData: {
      title: 'M. S. Oliveira (24 anos)',
      description: 'Mandado de prisão em aberto - Tráfico de Drogas',
      image: 'https://picsum.photos/seed/oliv/150/150?grayscale'
    }
  },
  { id: '3', sender: 'Eu', initials: 'EU', text: 'Copiado. Equipe do 1º BPM deslocando para apoio no cerco da região central.', time: '09:48', isMe: true, type: 'text' },
  { 
    id: '4', 
    sender: 'Eu', 
    initials: 'EU', 
    text: 'Local da última visualização (BR-356).', 
    time: '09:50', 
    isMe: true, 
    type: 'image',
    alertData: {
      title: '',
      description: '',
      image: 'https://picsum.photos/seed/loc/400/300'
    }
  },
];

const TacticalChatRoom: React.FC<TacticalChatRoomProps> = ({ onBack }) => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Eu',
      initials: 'EU',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text'
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki-light/30 overflow-hidden relative">
      <header className="bg-pmmg-navy px-4 py-3 flex items-center gap-3 shadow-lg z-50">
        <button onClick={onBack} className="text-white">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pmmg-khaki-light border-2 border-pmmg-yellow flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-pmmg-navy">groups</span>
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight uppercase tracking-tight">Tático Móvel - 1º BPM</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase">14 Oficiais em campo</p>
          </div>
        </div>
        <button className="text-white">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="flex justify-center my-4">
          <span className="bg-pmmg-navy/10 text-pmmg-navy/60 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">Hoje, 12 Mai</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.isMe ? 'flex-row-reverse' : 'max-w-[85%]'}`}>
            {!msg.isMe && (
              <div className="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center overflow-hidden border border-pmmg-navy/20">
                <span className="text-[10px] font-bold">{msg.initials}</span>
              </div>
            )}
            <div className={`flex flex-col gap-1 ${msg.isMe ? 'items-end' : ''}`}>
              {!msg.isMe && <span className="text-[9px] font-bold text-pmmg-navy/70 ml-1 uppercase">{msg.sender}</span>}
              
              {msg.type === 'text' && (
                <div className={`p-3 shadow-sm border ${msg.isMe ? 'bg-pmmg-navy text-white rounded-2xl rounded-tr-none border-pmmg-navy/5' : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border-pmmg-navy/5'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-[9px] ${msg.isMe ? 'text-white/60' : 'text-slate-400'}`}>{msg.time}</p>
                    {msg.isMe && <span className="material-symbols-outlined text-[12px] text-pmmg-yellow fill-icon">done_all</span>}
                  </div>
                </div>
              )}

              {msg.type === 'alert' && msg.alertData && (
                <div className="bg-white border-2 border-pmmg-red rounded-2xl rounded-tl-none shadow-sm overflow-hidden w-full max-w-[280px]">
                  <div className="bg-pmmg-red/10 px-3 py-2 flex justify-between items-center border-b border-pmmg-red/20">
                    <span className="text-[10px] font-bold text-pmmg-red uppercase">Alerta de Indivíduo</span>
                    <span className="material-symbols-outlined text-pmmg-red text-sm fill-icon">warning</span>
                  </div>
                  <div className="p-3 flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-cover bg-center border border-pmmg-navy/10" style={{ backgroundImage: `url(${msg.alertData.image})` }}></div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-pmmg-navy leading-tight">{msg.alertData.title}</h4>
                      <p className="text-[10px] text-slate-600 mt-1">{msg.alertData.description}</p>
                      <div className="mt-2 flex gap-1">
                        <span className="bg-pmmg-red text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Alta Periculosidade</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-pmmg-navy py-2 text-white text-[10px] font-bold uppercase tracking-wider">Ver Ficha Completa</button>
                </div>
              )}

              {msg.type === 'image' && msg.alertData && (
                <div className="bg-pmmg-navy p-1 rounded-2xl rounded-tr-none shadow-md overflow-hidden max-w-[200px]">
                  <div className="w-full aspect-[4/3] rounded-xl rounded-tr-none bg-cover bg-center" style={{ backgroundImage: `url(${msg.alertData.image})` }}></div>
                  <div className="px-2 py-1.5">
                    <p className="text-[11px] text-white">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className="text-[9px] text-white/60">{msg.time}</p>
                      <span className="material-symbols-outlined text-[12px] text-pmmg-yellow fill-icon">done_all</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="bg-white border-t border-slate-200 p-3 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center text-pmmg-navy rounded-full active:bg-slate-100">
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-pmmg-navy rounded-full active:bg-slate-100">
              <span className="material-symbols-outlined">location_on</span>
            </button>
          </div>
          <div className="flex-1 relative flex items-center">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-100 border-none rounded-full py-2 px-4 text-sm focus:ring-1 focus:ring-pmmg-navy/30 placeholder-slate-400" 
              placeholder="Mensagem tática..." 
              type="text" 
            />
            <button className="absolute right-2 text-pmmg-navy/50">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
          </div>
          <button 
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center bg-pmmg-navy text-white rounded-full shadow-md active:scale-95 transition-transform"
          >
            <span className={`material-symbols-outlined ${input.trim() ? '' : 'fill-icon'}`}>
              {input.trim() ? 'send' : 'mic'}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TacticalChatRoom;
