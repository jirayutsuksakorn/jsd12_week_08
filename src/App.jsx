// import { useState } from "react";
// import Castle from "./components/01_Castle";
// import SimpleAsyncAwait from "./example/SimpleAsyncAwait";

// export default function App() {
//   //creating state viarable
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");

//   const handleQuestion = (e) => {
//     console.log(e);
//     setQuestion(e.target.value);
//   }

//   const handleAnswer = (e) => {
//     console.log(e);
//     setAnswer(e.target.value);
//   }


//   return (
//     <div className="pb-80 py-10 gap-y-4 flex flex-col justify-center items-center min-h-screen bg-gray-800 text-white">
//       <p className="text-purple-300">Message for JSD12:
//         <span className="text-yellow-300">
//           {/*question or waiting for a message*/}
//           {question ? question : "Waiting for a message..."}
//         </span>
//       </p>
//       <textarea
//         value={question}
//         onChange={handleQuestion}
//         className="bg-white text-black rounded px-2 py-1" placeholder="Type your message here..." />
//       <p className="text-green-300 text-2xl">
//         Reply from secret room:
//         <span className="text-yellow-300 ">
//           {/* answer or waiting for a reply */}
//           {answer ? answer : "Waiting for a reply..."}
//         </span>
//       </p>
//       <Castle question={question} answer={answer} handleAnswer={handleAnswer} />
//       <SimpleAsyncAwait />
//     </div>
//   );
// }




import { useState, useEffect, useRef } from "react";
import Castle from "./components/01_Castle";
import rayquazaBg from "./assets/thumb-1920-1039168.png";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [helpedPokemon, setHelpedPokemon] = useState([]);
  const [isAppearing, setIsAppearing] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // ใช้ useRef เพื่อควบคุม Audio Object ให้เสถียรขึ้น
  const bgMusicRef = useRef(null);

  useEffect(() => {
    // สร้าง Audio Object เมื่อ Component โหลด
    bgMusicRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.2;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  const startSystem = () => {
    setIsAudioReady(true);
    // พยายามเล่นเพลงทันทีที่กดปุ่ม
    if (bgMusicRef.current) {
      bgMusicRef.current.play().catch(err => console.log("BGM Playback failed:", err));
    }
    // เสียงคลิกยืนยัน
    const clickSfx = new Audio("https://actions.google.com/sounds/v1/foley/button_click.ogg");
    clickSfx.play();
  };

  const fetchPokemonHelpers = async (count) => {
    try {
      setIsAppearing(false);
      const newList = [];
      for (let i = 0; i < count; i++) {
        const randomId = Math.floor(Math.random() * 151) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        newList.push({
          id: data.id,
          name: data.name,
          img: data.sprites.other["official-artwork"].front_default
        });
      }
      setHelpedPokemon(newList);
      setIsAppearing(true);

      // เสียงตอนตัวละครมา (ใช้ไฟล์มาตรฐาน Google)
      const spawnSfx = new Audio("https://actions.google.com/sounds/v1/foley/door_bell.ogg");
      spawnSfx.volume = 0.6;
      spawnSfx.play();
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleQuestion = (e) => {
    const text = e.target.value;
    setQuestion(text);

    // เสียงพิมพ์ (สั้นๆ ให้ความรู้สึกเหมือนพิมพ์ดีด)
    const typeSfx = new Audio("https://actions.google.com/sounds/v1/foley/keyboard_typing_fast_short.ogg");
    typeSfx.volume = 0.2;
    typeSfx.play().catch(() => { });

    if (text.includes("มีอะไรให้ช่วยไหม")) {
      fetchPokemonHelpers(1);
    } else if (text.toUpperCase() === "OK" && answer.includes("เข้ามาช่วยหน่อย")) {
      fetchPokemonHelpers(5);
    } else if (text === "") {
      setHelpedPokemon([]);
      setIsAppearing(false);
    }
  };

  const getDynamicBackground = () => {
    let overlayColor = "rgba(15, 23, 42, 0.8)";
    if (helpedPokemon.length === 1) overlayColor = "rgba(16, 185, 129, 0.6)";
    else if (helpedPokemon.length >= 5) overlayColor = "rgba(239, 68, 68, 0.6)";

    return {
      backgroundImage: `linear-gradient(to bottom, ${overlayColor}, rgba(15, 23, 42, 0.9)), url(${rayquazaBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans" style={getDynamicBackground()}>
      {!isAudioReady ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950">
          <div className="p-10 border-4 border-yellow-400 rounded-3xl bg-black/50 backdrop-blur-xl text-center shadow-[0_0_100px_rgba(250,204,21,0.3)]">
            <h2 className="text-yellow-400 text-5xl font-black mb-10 tracking-tighter uppercase italic">
              System Required
            </h2>
            <button
              onClick={startSystem}
              className="group relative bg-yellow-400 hover:bg-white text-black text-3xl font-black px-20 py-10 rounded-2xl transition-all duration-300 shadow-[0_15px_0_rgb(161,120,0)] hover:shadow-[0_15px_0_rgb(200,200,200)] active:translate-y-[10px] active:shadow-none"
            >
              ENABLE AUDIO
            </button>
            <p className="mt-8 text-white/30 text-sm font-mono tracking-[0.5em] animate-pulse">
              INITIALIZING SOUND DRIVERS...
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center w-full py-10 animate-in fade-in duration-1000">
          <h1 className="text-6xl font-black text-yellow-400 mb-10 uppercase tracking-[0.1em] drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
            Pokemon Rescue
          </h1>

          <div className="flex flex-wrap justify-center gap-10 min-h-[250px] mb-12">
            {helpedPokemon.map((p, i) => (
              <div key={i} className={`flex flex-col items-center transition-all duration-700 ${isAppearing ? 'scale-110 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <img src={p.img} className="w-44 h-44 drop-shadow-[0_20px_50px_rgba(255,255,255,0.3)] animate-bounce" alt={p.name} />
                <span className="mt-4 text-xs bg-black text-yellow-400 px-6 py-2 rounded-xl font-black uppercase border-2 border-yellow-400 shadow-2xl">{p.name}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 mb-16">
            <textarea
              value={question}
              onChange={handleQuestion}
              autoFocus
              className="text-white bg-black/80 border-4 border-yellow-400/40 p-8 rounded-[40px] w-[500px] shadow-[0_0_60px_rgba(0,0,0,0.9)] focus:border-yellow-400 outline-none transition-all font-mono text-center text-3xl placeholder:text-white/5"
              placeholder="ENTER COMMAND"
            />
          </div>

          <div className="w-full max-w-6xl flex justify-center px-6">
            <Castle question={question} answer={answer} setAnswer={setAnswer} />
          </div>
        </div>
      )}
    </div>
  );
}