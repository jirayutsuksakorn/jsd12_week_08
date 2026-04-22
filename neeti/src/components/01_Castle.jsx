import Tower from "./02_Tower";

export default function Castle({question, answer, handleAnswer}) {
  return (
    <div className="flex flex-col justify-center items-center pt-10 bg-red-500 w-full">
      <h1>Castle</h1>
      <Tower question={question} answer={answer} handleAnswer={handleAnswer}  />
    </div>
  );
}
