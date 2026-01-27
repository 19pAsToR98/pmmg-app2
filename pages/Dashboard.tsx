<!DOCTYPE html>
<html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Personal Tactical Database</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "pmmg-navy": "#002147",
                        "pmmg-khaki": "#c5b39a",
                        "pmmg-khaki-light": "#d7c9b7",
                        "pmmg-khaki-extra-light": "#e8e1d7",
                        "pmmg-yellow": "#ffcc00",
                        "pmmg-red": "#e31c1c",
                        "pmmg-blue": "#0047ab",
                        "pmmg-dark-grey": "#2d2d2d",
                    },
                    fontFamily: {
                        "sans": ["Inter", "system-ui", "sans-serif"],
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
            @apply bg-white border border-pmmg-navy/5 rounded-2xl shadow-sm;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
            font-variation-settings: 'FILL' 1;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
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
<body class="min-h-screen flex flex-col pb-24 bg-pmmg-khaki">
<header class="bg-pmmg-navy px-5 pt-10 pb-8 rounded-b-[2.5rem] shadow-2xl relative z-10">
<div class="flex items-center justify-between mb-8">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-inner">
<img alt="PMMG" class="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_LyCX8IqovjAUxXNBgCPmE1zHPl9QsCOlj1a8U10XFTSPbqFooJ00jvHiDGevYqUd7ETqJsz_RyJEFXwUTFu1NlDY187NwWdysQPPDi8cqUP5sLGbpxMfi7ZW9ilvOH1TSPvA08oVDzfOAWrMXN-I-_i05nfSr7aQ3Hka7Jpd45QzlPB8QMGuk1VeArNff4VebCg1BT73ch247Hik10dA1ke5-ckYyrMauOeLyvMYn8zzNwjHDhpP1Rk9pWaHN-3TC8wy-KcRIBI"/>
</div>
<div>
<h1 class="font-black text-lg text-white leading-tight tracking-tight">TACTICAL DB</h1>
<p class="text-[10px] text-pmmg-khaki font-bold uppercase tracking-widest">Personal Manager</p>
</div>
</div>
<button class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
<span class="material-symbols-outlined text-white">person</span>
</button>
</div>
<div class="relative group">
<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-pmmg-navy/50 text-2xl">search</span>
</div>
<input class="block w-full pl-12 pr-4 py-4 bg-white border-0 focus:ring-4 focus:ring-pmmg-yellow rounded-2xl text-base font-medium placeholder-pmmg-navy/40 shadow-lg" placeholder="Pesquisar Nome ou CPF" type="text"/>
</div>
</header>
<main class="px-5 -mt-4 space-y-6 relative z-0">
<section class="space-y-3">
<div class="flex items-center justify-between px-1">
<h3 class="text-[11px] font-black text-pmmg-navy uppercase tracking-widest">Meu Banco de Dados</h3>
<span class="text-[10px] font-bold text-pmmg-navy/70">Total: 449</span>
</div>
<div class="grid grid-cols-2 gap-3">
<div class="pmmg-card p-4 flex flex-col transition-transform active:scale-95">
<span class="text-[10px] font-bold text-slate-400 uppercase">Abordados</span>
<span class="text-2xl font-black text-pmmg-navy mt-1">215</span>
</div>
<div class="pmmg-card p-4 flex flex-col border-l-4 border-pmmg-yellow transition-transform active:scale-95">
<span class="text-[10px] font-bold text-slate-400 uppercase">Suspeitos</span>
<span class="text-2xl font-black text-pmmg-navy mt-1">89</span>
</div>
<div class="pmmg-card p-4 flex flex-col border-l-4 border-pmmg-red transition-transform active:scale-95">
<span class="text-[10px] font-bold text-slate-400 uppercase">Foragidos</span>
<span class="text-2xl font-black text-pmmg-red mt-1">142</span>
</div>
<div class="pmmg-card p-4 flex flex-col border-l-4 border-pmmg-dark-grey transition-transform active:scale-95">
<span class="text-[10px] font-bold text-slate-400 uppercase">CPF Cancelado</span>
<span class="text-2xl font-black text-pmmg-dark-grey mt-1">03</span>
</div>
</div>
</section>
<section class="flex justify-center">
<button class="w-full bg-pmmg-navy hover:bg-pmmg-navy/90 text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
<span class="material-symbols-outlined fill-icon text-pmmg-yellow text-2xl">person_add</span>
<span class="font-extrabold uppercase tracking-tight">Novo Cadastro</span>
</button>
</section>
<section class="space-y-3">
<h3 class="text-[11px] font-black text-pmmg-navy uppercase tracking-widest px-1">Ferramentas de IA</h3>
<div class="grid grid-cols-2 gap-3">
<button class="bg-white p-4 rounded-2xl shadow-sm border border-pmmg-navy/5 flex flex-col items-center gap-2 active:bg-slate-50 active:scale-95 transition-all">
<div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
<span class="material-symbols-outlined text-pmmg-blue text-2xl">minor_crash</span>
</div>
<span class="text-[10px] font-bold text-pmmg-navy uppercase text-center">Consultar Placa</span>
</button>
<button class="bg-white p-4 rounded-2xl shadow-sm border border-pmmg-navy/5 flex flex-col items-center gap-2 active:bg-slate-50 active:scale-95 transition-all">
<div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
<span class="material-symbols-outlined text-purple-600 text-2xl">psychology</span>
</div>
<span class="text-[10px] font-bold text-pmmg-navy uppercase text-center">Assistente de Relatos</span>
</button>
</div>
</section>
<section class="space-y-3 pb-4">
<div class="flex items-center justify-between px-1">
<h3 class="text-[11px] font-black text-pmmg-navy uppercase tracking-widest">Registros Recentes</h3>
<button class="text-[10px] font-bold text-pmmg-blue uppercase">Ver Todos</button>
</div>
<div class="space-y-2">
<div class="pmmg-card flex items-center p-3 gap-3 active:bg-slate-50 transition-colors">
<div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
<img alt="Photo" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChisPk75LpkgGWfFE_Y5dk1U6g0pirztI_Il_VQ2tvtKGZGn0_H-7RVw-1r_XMkj7wge3cMoMxisvJNBIJdk5WNWFS2PLz-tTOjtkcUAkwgl7jiKBsMUB7x9nC82fZzMUcz9NrLs9JKDR3-sykBX0t9F2fC03V_VF55qPrEwxXOj5l3oHUHGr2kOeOBSkbp1qPJJARg6RtO3MpuBzIwj0XH6m5iofnZ2hmeiGX7h-mOfqIQnxdKEyBUkZy7lrInl-oXF2JxgN80NU"/>
</div>
<div class="flex-1 min-w-0">
<h4 class="font-bold text-sm text-pmmg-navy uppercase truncate">Ricardo "Sombra" Silveira</h4>
<p class="text-[10px] font-medium text-slate-400">CPF: 084.***.***-09</p>
</div>
<div class="px-2 py-1 rounded-md bg-pmmg-red/10 text-pmmg-red text-[8px] font-black uppercase">
                    Foragido
                </div>
</div>
<div class="pmmg-card flex items-center p-3 gap-3 active:bg-slate-50 transition-colors">
<div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
<img alt="Photo" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd8_oMYgb8ZH2mw1kPQI1Dd2HmgngOeRZyeoJmK7rH9aDkWVmBmH4tEN62CGeXRfidT456v-P_-1k6Ag42981w7Tp_G8ps620LmHnBMJyrFtJiINKHmJ8R8ZhzHLsEym3sX82XhPD9WVKMF4cb_Ccg42vL6Pe9HUVAmDhIGk-0gr_XrNGP7p03bfP342lhdHEElhroXCGTD9P67yL-utAyqd0TIiNOiFb1xi7l0ImhEqO2USOS5gN_moUsmr_wGyyrnHUaTBDpfVM"/>
</div>
<div class="flex-1 min-w-0">
<h4 class="font-bold text-sm text-pmmg-navy uppercase truncate">Marcos Aurélio Lima</h4>
<p class="text-[10px] font-medium text-slate-400">CPF: 112.***.***-54</p>
</div>
<div class="px-2 py-1 rounded-md bg-pmmg-yellow/20 text-pmmg-navy text-[8px] font-black uppercase">
                    Suspeito
                </div>
</div>
</div>
</section>
</main>
<nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pmmg-khaki-light px-4 pt-3 pb-8 z-50 rounded-t-[2.5rem] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
<div class="flex items-center justify-between max-w-md mx-auto">
<a class="flex flex-col items-center gap-1 text-pmmg-navy flex-1" href="#">
<span class="material-symbols-outlined text-[26px] fill-icon">dashboard</span>
<span class="text-[8px] font-black uppercase tracking-wider">Início</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400 flex-1" href="#">
<span class="material-symbols-outlined text-[26px]">search</span>
<span class="text-[8px] font-bold uppercase tracking-wider">Busca</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400 flex-1" href="#">
<span class="material-symbols-outlined text-[26px]">folder_shared</span>
<span class="text-[8px] font-bold uppercase tracking-wider">Arquivos</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400 flex-1" href="#">
<span class="material-symbols-outlined text-[26px]">auto_awesome</span>
<span class="text-[8px] font-bold uppercase tracking-wider">Assistente</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400 flex-1" href="#">
<span class="material-symbols-outlined text-[26px]">settings</span>
<span class="text-[8px] font-bold uppercase tracking-wider">Config</span>
</a>
</div>
</nav>

</body></html>