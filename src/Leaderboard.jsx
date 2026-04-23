import React from 'react';

export default function Leaderboard({ scores, fighters }) {
    return (
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h3 className="text-center text-yellow-400 mb-4 uppercase font-bold tracking-widest text-xs italic">
                — Top Space Pilots —
            </h3>

            <div className="space-y-3">
                {scores.length === 0 ? (
                    <p className="text-center text-white/20 text-xs py-4">LOADING DATA...</p>
                ) : (
                    scores.map((u, i) => {
                        // ค้นหาข้อมูลตัวละครจากชื่อที่เก็บไว้ใน Database (เช่น "CHARMANDER")
                        const heroData = fighters.find(f => f.name === u.hero);

                        return (
                            <div key={i} className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <span className="text-white/40 font-bold w-4">{i + 1}.</span>

                                    {/* แสดงรูปตัวละคร ถ้ามีข้อมูล */}
                                    <div className="relative w-10 h-10 flex items-center justify-center bg-black/20 rounded-lg">
                                        {heroData ? (
                                            <img
                                                src={heroData.img}
                                                alt={u.hero}
                                                className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform"
                                            />
                                        ) : (
                                            <div className="text-[10px] text-white/20">?</div>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-white font-bold leading-none">{u.name}</span>
                                        <span className="text-[9px] text-cyan-400/60 uppercase tracking-tighter mt-1">
                                            {u.hero || 'RECRUIT'}
                                        </span>
                                    </div>
                                </div>

                                <span className="text-cyan-400 font-mono font-bold text-lg">
                                    {u.score?.toLocaleString()}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}