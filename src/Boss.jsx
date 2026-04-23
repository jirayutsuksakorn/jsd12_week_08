import React from 'react';

const Boss = ({ hp, maxHp, bossImg, xPos }) => {
    const hpPercent = (hp / maxHp) * 100;

    return (
        <div
            className="absolute top-10 flex flex-col items-center"
            style={{
                left: `${xPos}%`,
                transform: 'translateX(-50%)',
                zIndex: 20,
                transition: 'left 30ms linear' // เพิ่มความสมูท
            }}
        >
            {/* แถบเลือด Boss */}
            <div className="w-64 h-3 bg-gray-800 border border-white/30 rounded-full mb-1 overflow-hidden shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                <div
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
                    style={{ width: `${hpPercent}%` }}
                />
            </div>

            <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 text-[8px] animate-pulse">● LIVE</span>
                <span className="text-white text-[10px] font-black tracking-tighter uppercase opacity-80">
                    Boss HP: {hp.toLocaleString()}
                </span>
            </div>

            {/* ตัวบอส */}
            <div className="relative">
                <div className="animate-bounce">
                    <img
                        src={bossImg || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"}
                        className="w-44 h-44 drop-shadow-[0_0_30px_rgba(255,0,0,0.6)]"
                        alt="Boss"
                    />
                </div>
                <div className="absolute inset-0 bg-red-600/20 blur-[50px] rounded-full -z-10 animate-pulse"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-red-500/20 blur-xl rounded-[100%]"></div>
            </div>
        </div>
    );
};

export default Boss;