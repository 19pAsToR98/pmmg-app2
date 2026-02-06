<!DOCTYPE html>
<html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Officer Account Settings - PMMG</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "pmmg-navy": "#002147",
                        "pmmg-khaki": "#c5b39a",
                        "pmmg-khaki-light": "#dcd1c1",
                        "pmmg-yellow": "#ffcc00",
                        "pmmg-red": "#e31c1c",
                    },
                    fontFamily: {
                        "sans": ["Inter", "system-ui", "sans-serif"],
                    },
                    borderRadius: {
                        "pmmg-lg": "1.25rem",
                        "pmmg-md": "0.75rem",
                        "pmmg-sm": "0.5rem",
                    }
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        @layer base {
            body {
                @apply bg-pmmg-khaki text-slate-900 font-sans;
            }
        }
        .pmmg-card {
            @apply bg-white/80 border border-pmmg-navy/15 rounded-pmmg-lg shadow-sm backdrop-blur-md overflow-hidden;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
            font-variation-settings: 'FILL' 1;
        }
        .ios-list-item {
            @apply flex items-center justify-between py-4 border-b border-pmmg-navy/5 last:border-0 px-4;
        }
        .switch {
            @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none;
        }
        .switch-on { @apply bg-green-600; }
        .switch-off { @apply bg-slate-300; }
        .switch-dot {
            @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1;
        }
        .switch-dot-on { @apply translate-x-6; }
        .icon-container {
            @apply w-10 h-10 bg-pmmg-navy/5 flex items-center justify-center border border-pmmg-navy/10 rounded-pmmg-sm;
        }
    </style>
<style>
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="min-h-screen flex flex-col">
<header class="bg-pmmg-navy px-6 pt-12 pb-10 rounded-b-[2rem] shadow-2xl relative overflow-hidden">
<div class="absolute top-0 right-0 w-32 h-32 bg-pmmg-yellow/10 rounded-full -mr-16 -mt-16"></div>
<div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
<div class="relative z-10 flex flex-col items-center">
<div class="relative">
<div class="w-24 h-24 rounded-2xl border-2 border-pmmg-yellow/80 p-1 bg-white/10 mb-4 overflow-hidden shadow-xl">
<img alt="Officer Photo" class="w-full h-full object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA28K4eQ4nkFl0NN4bZnXiA0WvqTR8CN9RLw04qxdbV6Cq_rEyQFdKUo-MC3gWWkHEj05ar4jOSlnrQgrgYgeNqczumG4Rc98Smn3DrFk4M9aGmszD2Hgmnq1i2Ke_TAQEUgjsHX0Vg36vir2orQzF_vMZ8mQDiOVEJ0dyMiy08Tx7GPQXPjnbm0Qp8SLToy2qTDZi7-uboFjewpa79elmkeI-cPTk78ZV9jchyymygEr6GHxIsRIENu1rEI0NFyxXVXBp6N_-5wPA"/>
</div>
<div class="absolute bottom-4 -right-1 bg-pmmg-red text-white p-1 rounded-lg border border-pmmg-navy shadow-lg">
<span class="material-symbols-outlined text-[12px]">verified</span>
</div>
</div>
<h2 class="text-lg font-bold text-white uppercase tracking-tight">SGT. RODRIGO ALVES</h2>
<p class="text-pmmg-yellow font-semibold text-[10px] tracking-[0.2em] uppercase mt-1">Sargento de Polícia • 1ª Classe</p>
</div>
</header>
<main class="flex-1 px-4 -mt-6 pb-32 space-y-6">
<div class="pmmg-card p-4 flex items-center justify-between">
<div>
<h4 class="text-[10px] font-bold text-pmmg-navy/50 uppercase tracking-widest mb-1">Meus Registros</h4>
<p class="text-xl font-black text-pmmg-navy uppercase">142 <span class="text-[10px] font-normal text-slate-500 ml-1 tracking-normal italic">Suspeitos Identificados</span></p>
</div>
<div class="icon-container">
<span class="material-symbols-outlined text-pmmg-navy">person_search</span>
</div>
</div>
<section>
<h3 class="px-4 mb-2 text-[11px] font-bold text-pmmg-navy/80 uppercase tracking-widest">Dados da Conta</h3>
<div class="pmmg-card">
<div class="ios-list-item">
<div class="flex flex-col">
<span class="text-[9px] text-pmmg-navy/50 font-bold uppercase tracking-tighter">Nome Completo</span>
<span class="text-sm font-semibold text-pmmg-navy">Rodrigo Alves de Oliveira</span>
</div>
<button class="p-2 text-pmmg-navy/40 hover:text-pmmg-navy">
<span class="material-symbols-outlined text-lg">edit</span>
</button>
</div>
<div class="ios-list-item">
<div class="flex flex-col">
<span class="text-[9px] text-pmmg-navy/50 font-bold uppercase tracking-tighter">E-mail Institucional</span>
<span class="text-sm font-semibold text-pmmg-navy">rodrigo.alves@pmmg.mg.gov.br</span>
</div>
<button class="p-2 text-pmmg-navy/40 hover:text-pmmg-navy">
<span class="material-symbols-outlined text-lg">edit</span>
</button>
</div>
<div class="ios-list-item">
<div class="flex flex-col">
<span class="text-[9px] text-pmmg-navy/50 font-bold uppercase tracking-tighter">Senha de Acesso</span>
<span class="text-sm font-semibold text-pmmg-navy tracking-widest">••••••••••••</span>
</div>
<button class="p-2 text-pmmg-navy/40 hover:text-pmmg-navy">
<span class="material-symbols-outlined text-lg">edit</span>
</button>
</div>
</div>
</section>
<section>
<h3 class="px-4 mb-2 text-[11px] font-bold text-pmmg-navy/80 uppercase tracking-widest">Configurações e Segurança</h3>
<div class="pmmg-card">
<div class="ios-list-item">
<div class="flex items-center gap-3">
<div class="icon-container !w-8 !h-8">
<span class="material-symbols-outlined text-pmmg-navy text-xl">dark_mode</span>
</div>
<span class="text-sm font-semibold text-pmmg-navy">Modo Escuro</span>
</div>
<div class="switch switch-off">
<span class="switch-dot"></span>
</div>
</div>
<div class="ios-list-item">
<div class="flex items-center gap-3">
<div class="icon-container !w-8 !h-8">
<span class="material-symbols-outlined text-pmmg-navy text-xl">fingerprint</span>
</div>
<span class="text-sm font-semibold text-pmmg-navy">Habilitar Biometria</span>
</div>
<div class="switch switch-on">
<span class="switch-dot switch-dot-on"></span>
</div>
</div>
<button class="w-full ios-list-item active:bg-slate-50 transition-colors text-left">
<div class="flex items-center gap-3">
<div class="icon-container !w-8 !h-8">
<span class="material-symbols-outlined text-pmmg-navy text-xl">notifications_active</span>
</div>
<span class="text-sm font-semibold text-pmmg-navy">Configurações de Alerta</span>
</div>
<span class="material-symbols-outlined text-slate-400">chevron_right</span>
</button>
<button class="w-full ios-list-item active:bg-slate-50 transition-colors text-left">
<div class="flex items-center gap-3">
<div class="icon-container !w-8 !h-8">
<span class="material-symbols-outlined text-slate-400 text-xl">logout</span>
</div>
<span class="text-sm font-semibold text-slate-500">Sair do Sistema</span>
</div>
</button>
<button class="w-full ios-list-item active:bg-red-50 transition-colors text-left bg-red-50/30">
<div class="flex items-center gap-3">
<div class="icon-container !w-8 !h-8 bg-pmmg-red/10 border-pmmg-red/20">
<span class="material-symbols-outlined text-pmmg-red text-xl">delete_forever</span>
</div>
<span class="text-sm font-bold text-pmmg-red uppercase tracking-tight">Excluir Conta</span>
</div>
</button>
</div>
</section>
<div class="flex flex-col items-center justify-center opacity-40 py-8">
<img alt="PMMG Brasão" class="h-12 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_LyCX8IqovjAUxXNBgCPmE1zHPl9QsCOlj1a8U10XFTSPbqFooJ00jvHiDGevYqUd7ETqJsz_RyJEFXwUTFu1NlDY187NwWdysQPPDi8cqUP5sLGbpxMfi7ZW9ilvOH1TSPvA08oVDzfOAWrMXN-I-_i05nfSr7aQ3Hka7Jpd45QzlPB8QMGuk1VeArNff4VebCg1BT73ch247Hik10dA1ke5-ckYyrMauOeLyvMYn8zzNwjHDhpP1Rk9pWaHN-3TC8wy-KcRIBI"/>
<p class="text-[9px] font-bold uppercase tracking-[0.3em] mt-3 text-pmmg-navy">PMMG • Versão 2.5.0</p>
</div>
</main>
<nav class="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-pmmg-navy/10 px-4 py-3 pb-8 z-50 backdrop-blur-lg">
<div class="flex items-center justify-between max-w-md mx-auto">
<a class="flex flex-col items-center gap-1 text-pmmg-navy/40" href="#">
<span class="material-symbols-outlined text-[24px]">home</span>
<span class="text-[8px] font-black uppercase">Início</span>
</a>
<a class="flex flex-col items-center gap-1 text-pmmg-navy/40" href="#">
<span class="material-symbols-outlined text-[24px]">search</span>
<span class="text-[8px] font-black uppercase">Busca</span>
</a>
<a class="flex flex-col items-center gap-1 text-pmmg-navy/40" href="#">
<span class="material-symbols-outlined text-[24px]">folder_open</span>
<span class="text-[8px] font-black uppercase">Arquivos</span>
</a>
<a class="flex flex-col items-center gap-1 text-pmmg-navy/40" href="#">
<span class="material-symbols-outlined text-[24px]">smart_toy</span>
<span class="text-[8px] font-black uppercase">Assistente</span>
</a>
<a class="flex flex-col items-center gap-1 text-pmmg-navy" href="#">
<span class="material-symbols-outlined text-[24px] fill-icon">settings</span>
<span class="text-[8px] font-black uppercase tracking-tighter">Config</span>
</a>
</div>
</nav>
<div class="fixed inset-0 pointer-events-none z-[100] border-[4px] border-pmmg-navy/5 m-0"></div>

</body></html>