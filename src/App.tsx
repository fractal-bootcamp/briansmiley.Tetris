import { useEffect, useState } from "react";
import Board from "./Board";

const frameRate = 5;

function App() {
  const [frame, setFrame] = useState(1);
  useEffect(() => {
    setInterval(() => setFrame(frame + 1), 1000 / frameRate);
  }, []);
  return (
    <>
      <Board />
    </>
  );
}

export default App;
