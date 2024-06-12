import { useEffect, useState } from "react";

const frameRate = 5;

function App() {
  const [frame, setFrame] = useState(1);
  useEffect(() => {
    setInterval(() => setFrame(frame + 1), 1000 / frameRate);
  }, []);
  return <></>;
}

export default App;
