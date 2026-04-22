import { useState, useEffect, useRef } from "react";
// นำเข้า db จากไฟล์ firebase.js ที่คุณสร้างไว้
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

// --- Assets ---
const spaceBgm = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3");
const explosionSfx = new Audio("https://actions.google.com/sounds/v1/foley/explosion.ogg");
const powerUpSfx = new Audio("https://actions.google.com/sounds/v1/science_fiction/power_up.ogg");

const shootSounds = {
    BULBASAUR: new Audio("https://actions.google.com/sounds/v1/science_fiction/energy_whip.ogg"),
    CHARMANDER: new Audio("https://actions.google.com/sounds/v1/science_fiction/fire_extinguisher_blast.ogg"),
    SQUIRTLE: new Audio("https://actions.google.com/sounds/v1/science_fiction/water_splash.ogg")
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
    const [lastScore, setLastScore] = useState(null);
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);

    const isEndingRef = useRef(false);
    const scoreRef = useRef(0);

    useEffect(() => { scoreRef.current = score; }, [score]);

    // ดึงคะแนนจาก Firebase
    const fetchGlobalScores = async () => {
        try {
            const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
            const scores = querySnapshot.docs.map(doc => doc.data());
            setGlobalLeaderboard(scores);
        } catch (e) {
            console.error("Error fetching scores: ", e);
        }
    };

    useEffect(() => {
        if (gameState === "SELECT") {
            fetchGlobalScores();
        }
    }, [gameState]);

    const startGame = (hero) => {
        if (!playerName.trim()) {
            alert("กรุณาใส่ชื่อของคุณก่อนเริ่มภารกิจ!");
            return;
        }
        setLastScore(null);
        isEndingRef.current = false;
        setSelectedHero(hero);
        setGameState("PLAY");
        setScore(0);
        scoreRef.current = 0;
        setPowerLevel(1);
        setTimeLeft(60);
        setBullets([]); setEnemies([]); setItems([]);
        spaceBgm.currentTime = 0;
        spaceBgm.play().catch(() => { });
    };

    const gameOver = async () => {
        if (isEndingRef.current) return;
        isEndingRef.current = true;

        const finalScore = scoreRef.current;
        setLastScore({ name: playerName.toUpperCase(), score: finalScore });

        try {
            await addDoc(collection(db, "scores"), {
                name: playerName.toUpperCase(),
                score: finalScore,
                timestamp: new Date()
            });
            await fetchGlobalScores();
        } catch (e) {
            console.error("Error saving score: ", e);
        }

        setGameState("SELECT");
        spaceBgm.pause();
    };

    const shoot = () => {
        if (gameState !== "PLAY") return;
        const sfx = shootSounds[selectedHero?.sfx];
        if (sfx) { sfx.currentTime = 0; sfx.play().catch(() => { }); }

        if (powerLevel === 1) {
            setBullets(prev => [...prev, { id: Date.now(), x: playerX, y: 85, angle: 0 }]);
        } else {
            setBullets(prev => [
                { id: Date.now() + 1, x: playerX, y: 85, angle: -1.5 },
                { id: Date.now() + 2, x: playerX, y: 85, angle: 0 },
                { id: Date.now() + 3, x: playerX, y: 85, angle: 1.5 },
                ...prev
            ]);
        }
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
            setBullets(prev => prev.map(b => ({ ...b, y: b.y - 4, x: b.x + b.angle })).filter(b => b.y > 0));
            setEnemies(prev => {
                let next = prev.map(e => ({ ...e, y: e.y + 1.5 }));
                if (Math.random() < 0.05) next.push({ id: Date.now(), x: Math.random() * 90 + 5, y: -10 });
                return next.filter(e => e.y < 110);
            });
            setItems(prev => {
                let next = prev.map(i => ({ ...i, y: i.y + 1 }));
                if (Math.random() < 0.01) next.push({ id: Date.now(), x: Math.random() * 90 + 5, y: -10 });
                return next.filter(i => i.y < 110);
            });

            setBullets(currB => {
                let hitBullets = [];
                setEnemies(currE => {
                    let hitEnemies = [];
                    currB.forEach(b => {
                        currE.forEach(e => {
                            if (Math.hypot(b.x - e.x, b.y - e.y) < 6) {
                                hitBullets.push(b.id); hitEnemies.push(e.id);
                                setScore(s => s + 100);
                                explosionSfx.currentTime = 0; explosionSfx.play().catch(() => { });
                            }
                        });
                    });
                    return currE.filter(e => !hitEnemies.includes(e.id));
                });
                return currB.filter(b => !hitBullets.includes(b.id));
            });

            setItems(currI => {
                let collected = false;
                let remaining = currI.filter(i => {
                    if (Math.hypot(playerX - i.x, 85 - i.y) < 8) { collected = true; return false; }
                    return true;
                });
                if (collected) {
                    setPowerLevel(3); powerUpSfx.play().catch(() => { });
                    setTimeout(() => setPowerLevel(1), 5000);
                }
                return remaining;
            });
        }, 30);
        return () => { window.removeEventListener("keydown", handleKey); clearInterval(interval); };
    }, [gameState, playerX, powerLevel]);

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
            <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center text-white p-6 font-mono overflow-y-auto">
                <div className="w-full max-w-md text-center">
                    <h2 className="text-3xl font-black mb-4 text-cyan-400 italic tracking-tighter uppercase">Global Ranking</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 min-h-[150px] flex flex-col justify-center">
                        {globalLeaderboard.length === 0 ? (
                            <p className="text-white/20 text-xs animate-pulse">CONNECTING TO DATABASE...</p>
                        ) : (
                            globalLeaderboard.map((u, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-cyan-400 font-bold">{i + 1}. {u.name}</span>
                                    <span className="text-yellow-400">{u.score.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mb-8">
                        <label className="text-[10px] tracking-[0.4em] text-white/40 block mb-2 uppercase">Pilot Identity</label>
                        <input
                            type="text" maxLength={10} value={playerName}
                            onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                            className="bg-transparent border-b-2 border-cyan-500 text-center text-2xl font-bold w-full outline-none py-2 tracking-[0.2em]"
                            placeholder="???"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {fighters.map(f => (
                            <div
                                key={f.id} onClick={() => startGame(f)}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white/5 
                                    ${playerName ? 'border-white/10 hover:border-cyan-400 hover:scale-105' : 'opacity-20 grayscale'}`}
                            >
                                <img src={f.img} alt={f.name} className="w-full h-auto mb-2" />
                                <p className={`text-[8px] font-black ${f.color}`}>{f.name}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={onBack} className="text-white/20 text-[10px] underline uppercase tracking-widest">Exit Game</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-black overflow-hidden font-mono text-white">
            <div className="absolute top-6 inset-x-6 flex justify-between items-start z-10">
                <button onClick={gameOver} className="text-[10px] border border-red-500/50 px-3 py-1 rounded text-red-500 bg-black/50">ABORT</button>
                <div className="text-center">
                    <p className="text-[10px] text-white/50 tracking-widest uppercase">Time</p>
                    <p className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>{timeLeft}s</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold">{playerName}</p>
                    <p className="text-3xl font-black">{score.toLocaleString()}</p>
                </div>
            </div>
            {bullets.map(b => <div key={b.id} className="absolute w-1.5 h-6 bg-cyan-400 shadow-[0_0_15px_#22d3ee] rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, transform: `rotate(${b.angle * 15}deg)` }} />)}
            {items.map(i => <div key={i.id} className="absolute w-12 h-12 flex items-center justify-center text-3xl animate-bounce" style={{ left: `${i.x}%`, top: `${i.y}%` }}>🍬</div>)}
            {enemies.map(e => <img key={e.id} src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png" className="absolute w-14 h-14 drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]" style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translateX(-50%)' }} alt="enemy" />)}
            <div className="absolute bottom-10" style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}>
                <img src={selectedHero?.img} className="w-24 h-24 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" alt="player" />
                <div className="text-center text-[10px] mt-2 font-black tracking-widest bg-cyan-500 text-black px-2 rounded uppercase">{selectedHero?.name}</div>
            </div>
        </div>
    );
}