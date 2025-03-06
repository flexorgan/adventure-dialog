import { useEffect, useState } from 'react';
import './AdventureDialog.css';

function AdventureDialog() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [quest, setQuest] = useState('');
  const [color, setColor] = useState('');
  const [randomName, setRandomName] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(0);
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    fetch('/funnynames.csv')
      .then(response => response.text())
      .then(data => {
        const nameList = data.split('\n')
          .map(name => name.trim())
          .filter(name => name);
        setNames(nameList);
      })
      .catch(error => {
        console.error('Error loading names:', error);
        setNames(['Sir Lancelot', 'Sir Galahad', 'Sir Robin', 'Sir Bedevere']);
      });

    const intervalId = setInterval(() => {
      setGradientAngle(prev => (prev + 1) % 360);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, []);

  const getMatchingRandomName = (userFirstLetter: string) => {
    const matchingNames = names.filter(n => 
      n.charAt(0).toLowerCase() === userFirstLetter.toLowerCase()
    );
    
    if (matchingNames.length > 0) {
      return matchingNames[Math.floor(Math.random() * matchingNames.length)];
    } else {
      return names[Math.floor(Math.random() * names.length)];
    }
  };

  const questions = [
    { question: 'What is your name?', setter: setName },
    { question: 'What is your quest?', setter: setQuest },
    { question: 'What is your favorite color?', setter: setColor }
  ];

  const handleSubmit = (value: string) => {
    questions[step].setter(value);
    
    if (step === 0) {
      const newRandomName = getMatchingRandomName(value.charAt(0));
      setRandomName(newRandomName);
    }
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleStartOver = () => {
    const newRandomName = getMatchingRandomName(name.charAt(0));
    setRandomName(newRandomName);
    setStep(0);
    setName('');
    setQuest('');
    setColor('');
    setShowResult(false);
  };

  const isSpecialCase = 
    name.toLowerCase() === 'king arthur' &&
    quest.toLowerCase() === 'to seek the holy grail' &&
    color.toLowerCase() === 'green';

  const getMessage = () => {
    if (isSpecialCase) {
      return `Actually your name is ${randomName} and you're sentenced to death.\n\nHowever, since you answered with the correct responses, you are spared!`;
    }
    return `Actually your name is ${randomName} and you're sentenced to death.\n`;
  };

  const getBackgroundStyle = () => {
    if (!color) return 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
    
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
    
    ctx.fillStyle = color;
    const baseColor = ctx.fillStyle;
    
    ctx.fillStyle = color;
    const r = Math.min(255, parseInt(baseColor.slice(1, 3), 16) + 40);
    const g = Math.min(255, parseInt(baseColor.slice(3, 5), 16) + 40);
    const b = Math.min(255, parseInt(baseColor.slice(5, 7), 16) + 40);
    const lighterColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    
    return `linear-gradient(${gradientAngle}deg, ${baseColor}, ${lighterColor})`;
  };

  return (
    <div className={`adventure-dialog ${isVisible ? 'visible' : ''}`} style={{ background: getBackgroundStyle() }}>
      <div className="dialog-card mole-street-style">
        {!showResult ? (
          <>
            <h2>{questions[step].question}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('answer') as HTMLInputElement;
              handleSubmit(input.value);
              form.reset();
            }}>
              <input 
                type="text" 
                name="answer"
                autoFocus
                required
                placeholder="Enter your answer..."
              />
              <button type="submit">Answer</button>
            </form>
          </>
        ) : (
          <div className="result">
            <h2>Your Fate</h2>
            <p>{getMessage()}</p>
            <button onClick={handleStartOver}>Start Over</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdventureDialog;