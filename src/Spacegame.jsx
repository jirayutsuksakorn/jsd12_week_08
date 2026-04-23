import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
    collection, addDoc, getDocs, query, orderBy, limit,
    doc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import Boss from './Boss';
import Leaderboard from './Leaderboard'; // เพิ่มบรรทัดนี้

// --- Assets ---
const spaceBgm = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=8-bit-background-music-for-arcade-game-come-on-mario-164702.mp3");
const explosionSfx = new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_737215392e.mp3?filename=8-bit-explosion-95646.mp3");
const powerUpSfx = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=power-up-7103.mp3");

const shootSounds = {
    BULBASAUR: new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=laser-shoot-4-81420.mp3"),
    CHARMANDER: new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=laser-shoot-4-81420.mp3"),
    SQUIRTLE: new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=laser-shoot-4-81420.mp3")
};

const fighters = [
    { id: 1, name: "BULBASAUR", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", color: "text-green-400", sfx: "BULBASAUR", bulletColor: "bg-green-400 shadow-[0_0_15px_#4ade80]" },
    { id: 4, name: "CHARMANDER", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", color: "text-orange-500", sfx: "CHARMANDER", bulletColor: "bg-orange-500 shadow-[0_0_15px_#f97316]" },
    { id: 7, name: "SQUIRTLE", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", color: "text-blue-400", sfx: "SQUIRTLE", bulletColor: "bg-blue-400 shadow-[0_0_15px_#60a5fa]" }
];

export default function SpaceGame({ onBack }) {
    const [gameState, setGameState] = useState("SELECT");
    const [playerName, setPlayerName] = useState("");
    const [selectedHero, setSelectedHero] = useState(null);
    const [playerX, setPlayerX] = useState(50);
    const [bullets, setBullets] = useState([]);
    const [enemies, setEnemies] = useState([]);
    const [items, setItems] = useState([]);
    const [score, setScore] = useState(0);
    const [powerLevel, setPowerLevel] = useState(1);
    const [isShielded, setIsShielded] = useState(false);
    const [isFastShot, setIsFastShot] = useState(false);
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [isBossMode, setIsBossMode] = useState(false);
    const [bossHp, setBossHp] = useState(1000);
    const [timeLeft, setTimeLeft] = useState(60);
    const [bossX, setBossX] = useState(50);

    const playerIdRef = useRef(Math.random().toString(36).substring(7));
    const isEndingRef = useRef(false);
    const scoreRef = useRef(0);
    const playerXRef = useRef(50);
    const powerLevelRef = useRef(1);
    const lastShootTime = useRef(0);
    const frameRef = useRef({ bullets: [], enemies: [], items: [] });

    // CSS สำหรับพื้นหลังจักรยานแบบ Dynamic
    const styleTag = (
        <style>{`
            @keyframes space-move {
                from { transform: translateY(0); }
                to { transform: translateY(-1000px); }
            }
            .star-layer {
                position: absolute;
                inset: -1000px 0 0 0;
                background-repeat: repeat;
                animation: space-move linear infinite;
            }
            .stars-small {
                background-image: radial-gradient(1px 1px at 25px 35px, #fff, transparent),
                                radial-gradient(1px 1px at 50px 100px, #ddd, transparent),
                                radial-gradient(1px 1px at 90px 40px, #fff, transparent);
                background-size: 250px 250px;
                animation-duration: 80s;
                opacity: 0.4;
            }
            .stars-medium {
                background-image: radial-gradient(2px 2px at 100px 150px, #fff, transparent),
                                radial-gradient(2px 2px at 200px 50px, #fff, transparent);
                background-size: 400px 400px;
                animation-duration: 40s;
                opacity: 0.6;
            }
            .nebula {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 20% 30%, rgba(76, 29, 149, 0.15) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(8, 145, 178, 0.15) 0%, transparent 50%);
                filter: blur(40px);
            }
        `}</style>
    );

    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { playerXRef.current = playerX; }, [playerX]);
    useEffect(() => { powerLevelRef.current = powerLevel; }, [powerLevel]);

    const fetchGlobalScores = async () => {
        try {
            const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
            setGlobalLeaderboard(querySnapshot.docs.map(doc => doc.data()));
        } catch (e) { console.error("Firebase Error:", e); }
    };

    useEffect(() => { if (gameState === "SELECT") fetchGlobalScores(); }, [gameState]);

    const playSound = (audioObj) => {
        try {
            const sound = audioObj.cloneNode();
            sound.volume = 0.4;
            sound.play().catch(() => { });
        } catch (error) { }
    };

    const startGame = (hero) => {
        if (!playerName.trim()) return alert("กรุณาใส่ชื่อก่อนเริ่มเกม!");
        isEndingRef.current = false;
        setSelectedHero(hero);
        setGameState("PLAY");
        setScore(0);
        setPowerLevel(1);
        setIsShielded(false);
        setIsFastShot(false);
        setTimeLeft(60);
        setIsBossMode(false);
        setBossHp(1000);
        setBossX(50);
        frameRef.current = { bullets: [], enemies: [], items: [] };
        setBullets([]); setEnemies([]); setItems([]);
        spaceBgm.loop = true;
        spaceBgm.volume = 0.3;
        spaceBgm.play().catch(() => { });
    };

    const gameOver = async () => {
        if (isEndingRef.current) return;
        isEndingRef.current = true;
        try { spaceBgm.pause(); } catch (e) { }
        alert(`MISSION OVER!\nคะแนนของคุณ: ${scoreRef.current}`);
        await deleteDoc(doc(db, "online_players", playerIdRef.current)).catch(() => { });
        try {
            await addDoc(collection(db, "scores"), {
                name: playerName.toUpperCase(),
                score: scoreRef.current,
                hero: selectedHero.name,
                timestamp: serverTimestamp()
            });
            fetchGlobalScores();
        } catch (e) { }
        setGameState("SELECT");
    };

    const shoot = () => {
        if (gameState !== "PLAY" || isEndingRef.current) return;
        const now = Date.now();
        const cooldown = isFastShot ? 100 : 250;
        if (now - lastShootTime.current < cooldown) return;
        lastShootTime.current = now;

        const sfx = shootSounds[selectedHero?.sfx];
        if (sfx) playSound(sfx);

        const bX = playerXRef.current;
        let newBullets = [];

        if (powerLevelRef.current === 1) {
            newBullets = [{ id: Math.random(), x: bX, y: 85, angle: 0 }];
        } else if (powerLevelRef.current === 2) {
            newBullets = [
                { id: Math.random(), x: bX, y: 85, angle: -1.2 },
                { id: Math.random() + 1, x: bX, y: 85, angle: 1.2 }
            ];
        } else {
            newBullets = [
                { id: Math.random(), x: bX, y: 85, angle: -2.5 },
                { id: Math.random() + 1, x: bX, y: 85, angle: -1.2 },
                { id: Math.random() + 2, x: bX, y: 85, angle: 0 },
                { id: Math.random() + 3, x: bX, y: 85, angle: 1.2 },
                { id: Math.random() + 4, x: bX, y: 85, angle: 2.5 }
            ];
        }
        frameRef.current.bullets = [...frameRef.current.bullets, ...newBullets];
        setBullets([...frameRef.current.bullets]);
    };

    useEffect(() => {
        if (gameState !== "PLAY") return;
        const handleKey = (e) => {
            if (e.key === "ArrowLeft") setPlayerX(p => Math.max(5, p - 5.5));
            if (e.key === "ArrowRight") setPlayerX(p => Math.min(95, p + 5.5));
            if (e.key === " ") shoot();
        };
        window.addEventListener("keydown", handleKey);

        const interval = setInterval(() => {
            if (isEndingRef.current) return;
            let { bullets: b, enemies: e, items: i } = frameRef.current;

            let currentBossX = 50;
            if (isBossMode) {
                currentBossX = 50 + Math.sin(Date.now() / 1200) * 25;
                setBossX(currentBossX);
            }

            b = b.map(bullet => ({
                ...bullet,
                y: bullet.y - 4,
                x: bullet.x + (bullet.angle || 0)
            })).filter(bullet => bullet.y > -5);

            if (!isBossMode) {
                if (Math.random() < 0.05) e.push({ id: Math.random(), x: Math.random() * 90 + 5, y: -10 });
                e = e.map(enemy => ({ ...enemy, y: enemy.y + 1.3 }));
            } else {
                e = e.map(enemy => ({ ...enemy, y: enemy.y + 1.5 }));
            }
            e = e.filter(enemy => enemy.y < 110);

            if (Math.random() < 0.01) {
                const types = ["⭐", "🛡️", "⚡", "⏳"];
                const selectedType = types[Math.floor(Math.random() * types.length)];
                i.push({ id: Math.random(), x: Math.random() * 90 + 5, y: -10, type: selectedType });
            }
            i = i.map(item => ({ ...item, y: item.y + 1.2 })).filter(item => item.y < 110);

            let hitBullets = new Set();
            let hitEnemies = new Set();
            let hitItems = new Set();

            b.forEach(bullet => {
                e.forEach(enemy => {
                    if (Math.abs(bullet.x - enemy.x) < 8 && Math.abs(bullet.y - enemy.y) < 8) {
                        hitBullets.add(bullet.id);
                        hitEnemies.add(enemy.id);
                        setScore(s => s + 100);
                        playSound(explosionSfx);
                    }
                });
                if (isBossMode && bullet.y < 35 && Math.abs(bullet.x - currentBossX) < 15) {
                    hitBullets.add(bullet.id);
                    setBossHp(prev => Math.max(0, prev - 8));
                    playSound(explosionSfx);
                }
            });

            i.forEach(item => {
                const dx = playerXRef.current - item.x;
                const dy = 85 - item.y;
                if (Math.sqrt(dx * dx + dy * dy) < 12) {
                    hitItems.add(item.id);
                    playSound(powerUpSfx);
                    if (item.type === "⭐") setPowerLevel(p => Math.min(3, p + 1));
                    if (item.type === "🛡️") setIsShielded(true);
                    if (item.type === "⚡") {
                        setIsFastShot(true);
                        setTimeout(() => setIsFastShot(false), 8000);
                    }
                    if (item.type === "⏳") setTimeLeft(t => t + 10);
                }
            });

            e.forEach(enemy => {
                const dx = playerXRef.current - enemy.x;
                const dy = 85 - enemy.y;
                if (Math.sqrt(dx * dx + dy * dy) < 8) {
                    if (isShielded) {
                        setIsShielded(false);
                        hitEnemies.add(enemy.id);
                        playSound(explosionSfx);
                    } else {
                        gameOver();
                    }
                }
            });

            frameRef.current = {
                bullets: b.filter(bullet => !hitBullets.has(bullet.id)),
                enemies: e.filter(enemy => !hitEnemies.has(enemy.id)),
                items: i.filter(item => !hitItems.has(item.id))
            };
            setBullets(frameRef.current.bullets);
            setEnemies(frameRef.current.enemies);
            setItems(frameRef.current.items);
        }, 30);

        return () => {
            window.removeEventListener("keydown", handleKey);
            clearInterval(interval);
        };
    }, [gameState, isBossMode, isShielded, isFastShot]);

    useEffect(() => {
        if (gameState !== "PLAY") return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === 11) {
                    setIsBossMode(true);
                    frameRef.current.enemies = [];
                    setEnemies([]);
                }
                if (prev <= 1) {
                    clearInterval(timer);
                    gameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    useEffect(() => {
        if (isBossMode && bossHp <= 0) {
            setScore(s => s + 5000);
            setTimeout(() => {
                alert("VICTORY! คุณปราบบอสสำเร็จ!");
                gameOver();
            }, 500);
        }
    }, [bossHp, isBossMode]);

    if (gameState === "SELECT") {
        return (
            <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col items-center justify-center text-white p-6 font-mono">
                {styleTag}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="nebula" />
                    <div className="star-layer stars-small" />
                    <div className="star-layer stars-medium" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-4xl font-black mb-10 text-cyan-400 italic drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">POKE SHOOTER</h2>
                    <Leaderboard scores={globalLeaderboard} fighters={fighters} />
                    <input type="text" maxLength={10} value={playerName} onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                        className="bg-transparent border-b-2 border-cyan-500 text-center text-2xl font-bold w-64 outline-none mb-10" placeholder="NAME" />
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        {fighters.map(f => (
                            <div key={f.id} onClick={() => startGame(f)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${playerName ? 'border-white/10 hover:border-cyan-400 bg-white/5 scale-105' : 'opacity-20 grayscale'}`}>
                                <img src={f.img} alt={f.name} className="w-16 h-16" />
                            </div>
                        ))}
                    </div>
                    <button onClick={onBack} className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Exit Game</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-[#020617] overflow-hidden font-mono text-white">
            {styleTag}
            {/* --- DYNAMIC BACKGROUND LAYERS --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="nebula" />
                <div className="star-layer stars-small" />
                <div className="star-layer stars-medium" />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-cyan-900/10" />
            </div>

            {/* Header UI */}
            <div className="absolute top-6 inset-x-8 flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase">Mission Score</span>
                    <span className="text-2xl font-black text-yellow-400">{score.toLocaleString()}</span>
                </div>
                <div className={`px-6 py-2 rounded-full border-2 ${timeLeft < 10 ? 'border-red-500 animate-pulse' : 'border-cyan-500/30'} bg-black/50 backdrop-blur-md`}>
                    <span className={`text-3xl font-black ${timeLeft < 10 ? 'text-red-500' : 'text-cyan-400'}`}>{timeLeft}s</span>
                </div>
                <div className="text-right">
                    <button onClick={gameOver} className="text-[10px] text-red-500 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all uppercase">Abort</button>
                </div>
            </div>

            {/* Bullets */}
            {bullets.map(b => (
                <div key={b.id}
                    className={`absolute w-1.5 h-7 rounded-full ${selectedHero?.bulletColor}`}
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        transform: `translateX(-50%) rotate(${(b.angle || 0) * 12}deg)`
                    }}
                />
            ))}

            {/* Items */}
            {items.map(i => (
                <div key={i.id} className="absolute text-3xl animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    style={{ left: `${i.x}%`, top: `${i.y}%`, transform: 'translateX(-50%)' }}>
                    {i.type}
                </div>
            ))}

            {/* Enemies */}
            {enemies.map(e => (
                <img key={e.id} src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png"
                    className="absolute w-14 h-14 drop-shadow-[0_0_15px_#ef4444]"
                    style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translateX(-50%)' }} alt="enemy" />
            ))}

            {/* Boss */}
            {isBossMode && <Boss hp={bossHp} maxHp={1000} xPos={bossX} />}

            {/* Player Character */}
            <div className="absolute bottom-10" style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}>
                <div className="relative">
                    {isShielded && (
                        <div className="absolute -inset-6 border-4 border-cyan-400/50 rounded-full animate-[spin_3s_linear_infinite] shadow-[0_0_20px_#22d3ee]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                        </div>
                    )}

                    <img
                        src={selectedHero?.img}
                        className={`w-24 h-24 transition-all duration-300 
                            ${powerLevel > 2 ? 'drop-shadow-[0_0_35px_#fbbf24] scale-110' : 'drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]'}
                            ${isFastShot ? 'animate-pulse contrast-125' : ''}`}
                        alt="player"
                    />

                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 flex flex-col items-center gap-1">
                        <div className="flex gap-1">
                            {[...Array(powerLevel)].map((_, idx) => (
                                <div key={idx} className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                            ))}
                        </div>
                        <span className="text-[9px] font-black bg-white text-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-lg">
                            {selectedHero?.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}