import React, { useEffect, useState, useRef } from "react";

interface AnimatedWordProps {
  words: string[];
  interval?: number; // pause duration per word
  className?: string;
  animationDuration?: number; // scroll duration
  onWordChange?: (word: string, shouldCenter: boolean) => void;
}

const AnimatedWord: React.FC<AnimatedWordProps> = ({
  words,
  interval = 2000,
  className = "",
  animationDuration = 600,
  onWordChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Calculate the width needed for the longest word and check if we should center
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if mobile
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.style.fontSize = 'inherit';
      tempSpan.style.fontWeight = '600';
      tempSpan.style.fontFamily = 'inherit';
      document.body.appendChild(tempSpan);
      
      let maxWidth = 0;
      words.forEach(word => {
        tempSpan.textContent = word;
        const width = tempSpan.offsetWidth;
        maxWidth = Math.max(maxWidth, width);
      });
      
      document.body.removeChild(tempSpan);
      setContainerWidth(maxWidth);
      
      // Check if current word is one of the last two words that need centering
      const lastTwoWords = words.slice(-2);
      const needsCentering = lastTwoWords.includes(words[currentIndex]);
      setShouldCenter(needsCentering);
      
      // Notify parent component about word change and centering needs
      if (onWordChange) {
        onWordChange(words[currentIndex], needsCentering);
      }
      
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, [words, currentIndex]);

  useEffect(() => {
    const advanceToNext = () => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex === words.length - 1) {
          // We're at the last word, animate to cloned first word
          setIsAnimating(true);
          // After animation duration, snap back to first word
          setTimeout(() => {
            setIsAnimating(false);
            setCurrentIndex(0);
          }, animationDuration);
          return words.length; // Move to cloned word position
        } else {
          // Normal progression to next word
          setIsAnimating(true);
          return prevIndex + 1;
        }
      });
    };

    // Start cycling after the initial display time
    const timer = setInterval(advanceToNext, interval);

    return () => clearInterval(timer);
  }, [words.length, interval, animationDuration]);

  return (
    <>
             <style jsx>{`
         @keyframes liquidFlow {
           0% {
             background-position: 0% 50%;
           }
           25% {
             background-position: 100% 50%;
           }
           50% {
             background-position: 100% 0%;
           }
           75% {
             background-position: 0% 0%;
           }
           100% {
             background-position: 0% 50%;
           }
         }
         
         .liquid-gradient {
           background: linear-gradient(
             45deg,
             #eac766 0%,
             #c1a139 15%,
             #fbed93 30%,
             #f5e357 45%,
             #fef54f 60%,
             #fed400 75%,
             #e9d343 90%,
             #f9ef38 100%
           );
           background-size: 400% 400%;
           animation: liquidFlow 8s ease-in-out infinite;
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           background-clip: text;
           color: transparent;
         }
         
         .animated-word-container {
           position: relative;
           display: inline-block;
           overflow: hidden;
           text-align: center;
         }
       `}</style>
      
                                                                                                               <span
            ref={containerRef}
            className={`animated-word-container ${className}`}
            style={{
              height: "1.2em",
              lineHeight: "1.2em",
              verticalAlign: "baseline",
              width: "max-content",
              display: "inline-block",
              transform: isMobile ? "translateY(3px)" : "translateY(12px)", // Reduced gap on mobile
            }}
          >
        <div
          className={`${
            isAnimating ? "transition-transform ease-out" : ""
          }`}
          style={{
            transitionDuration: isAnimating ? `${animationDuration}ms` : "0ms",
            transform: `translateY(-${currentIndex * 1.2}em)`,
            transitionTimingFunction: isAnimating ? "cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "ease",
          }}
        >
          {words.map((word, index) => (
            <div
              key={index}
              className="liquid-gradient"
              style={{
                height: "1.2em",
                lineHeight: "1.2em",
                display: "flex",
                alignItems: "flex-end",
                fontWeight: "600",
              }}
            >
              {word}
            </div>
          ))}
          {/* Clone first word for seamless loop */}
          <div
            className="liquid-gradient"
            style={{
              height: "1.2em",
              lineHeight: "1.2em",
              display: "flex",
              alignItems: "flex-end",
              fontWeight: "600",
            }}
          >
            {words[0]}
          </div>
        </div>
      </span>
    </>
  );
};

export default AnimatedWord;