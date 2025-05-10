import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Carousel = () => {
  // Premium dress collection data
  const collections = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9',
      title: 'Ethereal Elegance',
      subtitle: 'Spring 2023 Collection',
      cta: 'Discover Now',
      badge: 'New Arrivals',
      colors: ['bg-rose-100', 'bg-amber-100', 'bg-sky-100']
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
      title: 'Midnight Velvet',
      subtitle: 'Evening Gowns',
      cta: 'Shop Evening Wear',
      badge: 'Best Sellers',
      colors: ['bg-indigo-100', 'bg-purple-100', 'bg-blue-100']
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
      title: 'Tropical Romance',
      subtitle: 'Summer Dresses',
      cta: 'Explore Summer',
      badge: 'Trending',
      colors: ['bg-emerald-100', 'bg-teal-100', 'bg-lime-100']
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
      title: 'Urban Chic',
      subtitle: 'City Style Collection',
      cta: 'View Urban Styles',
      badge: 'Limited Edition',
      colors: ['bg-gray-100', 'bg-stone-100', 'bg-neutral-100']
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoRotateInterval = 8000; // 8 seconds

  // Auto rotation with pause on hover
  useEffect(() => {
    let interval;
    if (!isHovered && !isDragging) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % collections.length);
      }, autoRotateInterval);
    }
    return () => clearInterval(interval);
  }, [isHovered, isDragging, collections.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % collections.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = dragStartX.current - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
    })
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } }
  };

  return (
    <div 
      className="relative w-full h-screen max-h-[100vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated background colors */}
      <div className="absolute inset-0 overflow-hidden">
        {collections.map((collection, index) => (
          <motion.div
            key={`bg-${index}`}
            className={`absolute inset-0 ${collection.colors[0]} transition-colors duration-1000`}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          />
        ))}
      </div>

      {/* Main carousel */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            {/* Image with parallax effect */}
            <motion.div 
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            >
              <img
                src={`${collections[currentIndex].image}?auto=format&fit=crop&w=1920&q=80`}
                alt={collections[currentIndex].title}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            </motion.div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end pb-20 md:pb-32 px-6 md:px-12 text-white">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="max-w-2xl"
              >
                {collections[currentIndex].badge && (
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-white bg-black/30 backdrop-blur-sm rounded-full border border-white/20">
                    {collections[currentIndex].badge}
                  </span>
                )}
                
                <motion.h2 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2 leading-tight"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {collections[currentIndex].title}
                </motion.h2>
                
                <motion.p 
                  className="text-xl md:text-2xl mb-6 opacity-90 max-w-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {collections[currentIndex].subtitle}
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {/* <button className="px-8 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 flex items-center gap-2">
                    {collections[currentIndex].cta}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button> */}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {isHovered && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {collections.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative w-16 h-1 rounded-full overflow-hidden bg-white/30"
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentIndex && (
              <motion.div 
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: autoRotateInterval/1000, ease: 'linear' }}
                onAnimationComplete={() => {
                  if (index === currentIndex && !isHovered && !isDragging) {
                    nextSlide();
                  }
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Color palette indicator */}
      <div className="absolute bottom-8 right-6 z-10 flex gap-2">
        {collections[currentIndex].colors.map((color, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full ${color} border border-white/30`}
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;