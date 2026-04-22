import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
    collection, addDoc, getDocs, query, orderBy, limit,
    doc, deleteDoc, serverTimestamp
} from "firebase/firestore";

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
    { id: 1, name: "BULBASAUR", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", color: "text-green-400", sfx: "BULBASAUR" },
    { id: 4, name: "CHARMANDER", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", color: "text-orange-500", sfx: "CHARMANDER" },
    { id: 7, name: "SQUIRTLE", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", color: "text-blue-400", sfx: "SQUIRTLE" }
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
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);

    const playerIdRef = useRef(Math.random().toString(36).substring(7));
    const isEndingRef = useRef(false);
    const scoreRef = useRef(0);
    const playerXRef = useRef(50);
    const powerLevelRef = useRef(1); // 🔥 เพิ่ม Ref เพื่อใช้ในฟังก์ชันยิง
    const frameRef = useRef({ bullets: [], enemies: [], items: [] });
    const powerTimerRef = useRef(null);

    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { playerXRef.current = playerX; }, [playerX]);
    useEffect(() => { powerLevelRef.current = powerLevel; }, [powerLevel]); // คอย Sync ค่าจาก State ลง Ref

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
            audioObj.currentTime = 0;
            audioObj.play().catch(() => { });
        } catch (error) { }
    };

    const startGame = (hero) => {
        if (!playerName.trim()) return alert("กรุณาใส่ชื่อก่อนเริ่มเกม!");
        isEndingRef.current = false;
        setSelectedHero(hero); setGameState("PLAY"); setScore(0);
        setPowerLevel(1); setTimeLeft(60);
        frameRef.current = { bullets: [], enemies: [], items: [] };
        setBullets([]); setEnemies([]); setItems([]);

        spaceBgm.loop = true;
        spaceBgm.volume = 0.3;
        playSound(spaceBgm);
    };

    const gameOver = async () => {
        if (isEndingRef.current) return;
        isEndingRef.current = true;
        try { spaceBgm.pause(); } catch (e) { }
        alert(`GAME OVER! คุณโดนชน\nได้คะแนนไป: ${scoreRef.current}`);
        await deleteDoc(doc(db, "online_players", playerIdRef.current)).catch(() => { });
        try {
            await addDoc(collection(db, "scores"), {
                name: playerName.toUpperCase(),
                score: scoreRef.current,
                timestamp: serverTimestamp()
            });
            fetchGlobalScores();
        } catch (e) { }
        setGameState("SELECT");
    };

    const shoot = () => {
        if (gameState !== "PLAY" || isEndingRef.current) return;
        const sfx = shootSounds[selectedHero?.sfx];
        if (sfx) playSound(sfx);

        const bX = playerXRef.current;
        let newBullets = [];

        // 🔥 ใช้ powerLevelRef.current แทน State เพื่อความไว
        if (powerLevelRef.current === 1) {
            newBullets = [{ id: Math.random(), x: bX, y: 85, angle: 0 }];
        } else {
            newBullets = [
                { id: Math.random(), x: bX, y: 85, angle: -1.2 },
                { id: Math.random() + 1, x: bX, y: 85, angle: 0 },
                { id: Math.random() + 2, x: bX, y: 85, angle: 1.2 }
            ];
        }

        frameRef.current.bullets = [...frameRef.current.bullets, ...newBullets];
        setBullets([...frameRef.current.bullets]);
    };

    useEffect(() => {
        if (gameState !== "PLAY") return;

        const handleKey = (e) => {
            if (e.key === "ArrowLeft") setPlayerX(p => Math.max(5, p - 5));
            if (e.key === "ArrowRight") setPlayerX(p => Math.min(95, p + 5));
            if (e.key === " ") shoot();
        };
        window.addEventListener("keydown", handleKey);

        const interval = setInterval(() => {
            if (isEndingRef.current) return;

            let { bullets: b, enemies: e, items: i } = frameRef.current;

            // 1. อัปเดตตำแหน่ง (คำนวณ angle เข้าไปใน X)
            b = b.map(bullet => ({
                ...bullet,
                y: bullet.y - 4,
                x: bullet.x + (bullet.angle || 0)
            })).filter(bullet => bullet.y > 0 && bullet.x > 0 && bullet.x < 100);

            e = e.map(enemy => ({ ...enemy, y: enemy.y + 1.2 }));
            if (Math.random() < 0.04) e.push({ id: Math.random(), x: Math.random() * 90 + 5, y: -10 });
            e = e.filter(enemy => enemy.y < 110);

            i = i.map(item => ({ ...item, y: item.y + 1 }));
            if (Math.random() < 0.008) i.push({ id: Math.random(), x: Math.random() * 90 + 5, y: -10 });
            i = i.filter(item => item.y < 110);

            // 2. เช็คการชน: กระสุน ชน ศัตรู
            let hitBullets = new Set();
            let hitEnemies = new Set();
            b.forEach(bullet => {
                e.forEach(enemy => {
                    const dx = bullet.x - enemy.x;
                    const dy = bullet.y - enemy.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 10) {
                        hitBullets.add(bullet.id);
                        hitEnemies.add(enemy.id);
                    }
                });
            });

            if (hitEnemies.size > 0) {
                setScore(s => s + (hitEnemies.size * 100));
                playSound(explosionSfx);
            }
            b = b.filter(bullet => !hitBullets.has(bullet.id));
            e = e.filter(enemy => !hitEnemies.has(enemy.id));

            // 3. เช็คการชน: ศัตรู ชน ผู้เล่น
            let playerHit = false;
            e.forEach(enemy => {
                const dx = playerXRef.current - enemy.x;
                const dy = 85 - enemy.y;
                if (Math.sqrt(dx * dx + dy * dy) < 8) playerHit = true;
            });
            if (playerHit) { gameOver(); return; }

            // 4. เช็คการชน: เก็บไอเทม (🌟)
            let collectedItem = false;
            i = i.filter(item => {
                const dx = playerXRef.current - item.x;
                const dy = 85 - item.y;
                if (Math.sqrt(dx * dx + dy * dy) < 12) {
                    collectedItem = true;
                    return false;
                }
                return true;
            });

            if (collectedItem) {
                setPowerLevel(3);
                playSound(powerUpSfx);
                if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
                powerTimerRef.current = setTimeout(() => {
                    setPowerLevel(1);
                }, 10000);
            }

            frameRef.current = { bullets: b, enemies: e, items: i };
            setBullets(b); setEnemies(e); setItems(i);
        }, 30);

        return () => {
            window.removeEventListener("keydown", handleKey);
            clearInterval(interval);
            if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
        };
    }, [gameState]);

    useEffect(() => {
        if (gameState !== "PLAY") return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); gameOver(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    if (gameState === "SELECT") {
        return (
            <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center text-white p-6 font-mono">
                <div className="w-full max-w-md text-center">
                    <h2 className="text-3xl font-black mb-4 text-cyan-400 italic uppercase">Global Ranking</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 min-h-[150px] flex flex-col justify-center">
                        {globalLeaderboard.length === 0 ? <p className="text-white/20 text-xs">CONNECTING...</p> :
                            globalLeaderboard.map((u, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-cyan-400 font-bold">{i + 1}. {u.name}</span>
                                    <span className="text-yellow-400">{u.score?.toLocaleString()}</span>
                                </div>
                            ))}
                    </div>
                    <div className="mb-8">
                        <input type="text" maxLength={10} value={playerName} onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                            className="bg-transparent border-b-2 border-cyan-500 text-center text-2xl font-bold w-full outline-none py-2" placeholder="ENTER NAME" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {fighters.map(f => (
                            <div key={f.id} onClick={() => startGame(f)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white/5 ${playerName ? 'border-white/10 hover:border-cyan-400 hover:scale-105' : 'opacity-20 grayscale'}`}>
                                <img src={f.img} alt={f.name} className="w-full h-auto mb-2" />
                                <p className={`text-[8px] font-black ${f.color}`}>{f.name}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={onBack} className="text-white/20 text-[10px] underline uppercase">Exit</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-black overflow-hidden font-mono text-white">
            <div className="absolute top-6 inset-x-6 flex justify-between items-start z-10">
                <button onClick={gameOver} className="text-[10px] border border-red-500/50 px-3 py-1 rounded text-red-500 bg-black/50">ABORT</button>
                <div className="text-center bg-black/50 px-4 py-1 rounded-full border border-cyan-500/30">
                    <p className="text-3xl font-black text-cyan-400">{timeLeft}s</p>
                </div>
                <div className="text-right bg-black/50 px-4 py-1 rounded-full border border-yellow-500/30">
                    <p className="text-3xl font-black text-yellow-400">{score.toLocaleString()}</p>
                </div>
            </div>

            {/* Bullets */}
            {bullets.map(b => (
                <div key={b.id}
                    className={`absolute w-1.5 h-6 rounded-full ${powerLevel > 1 ? 'bg-yellow-400 shadow-[0_0_15px_#fbbf24]' : 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]'}`}
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        transform: `translateX(-50%) rotate(${(b.angle || 0) * 15}deg)`
                    }}
                />
            ))}

            {items.map(i => <div key={i.id} className="absolute w-12 h-12 text-3xl animate-bounce drop-shadow-[0_0_15px_#fbbf24]" style={{ left: `${i.x}%`, top: `${i.y}%`, transform: 'translateX(-50%)' }}>🌟</div>)}
            {enemies.map(e => <img key={e.id} src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png" className="absolute w-14 h-14 drop-shadow-[0_0_10px_#ef4444]" style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translateX(-50%)' }} alt="enemy" />)}

            {/* Player Character */}
            <div className="absolute bottom-10" style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}>
                <img
                    src={selectedHero?.img}
                    className={`w-24 h-24 transition-all duration-300 ${powerLevel > 1 ? 'drop-shadow-[0_0_35px_#fbbf24] scale-110' : 'drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]'}`}
                    alt="player"
                />
                {powerLevel > 1 && <div className="text-center text-[10px] text-yellow-400 font-bold animate-pulse mt-1">POWER UP!</div>}
                <div className="text-center font-black bg-cyan-500 text-black px-2 rounded uppercase text-[10px] mt-2">{selectedHero?.name}</div>
            </div>
        </div>
    );
}