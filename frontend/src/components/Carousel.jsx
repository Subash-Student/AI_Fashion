import React, { useState } from 'react'

import { BsArrowLeftCircleFill,BsArrowRightCircleFill } from 'react-icons/bs'

import './carousel.css'

export const Carousel = ({ data }) => {

  const [slide,setSlide] = useState(0);

  const nextSlide = ()=>
  {
    setSlide( slide === data.length -1 ? 0 : slide+1);
  }
  const preSlide = ()=>
  {
    setSlide(slide === 0 ? data.length - 1 :slide-1);
  }

  console.log(data)
  return (
    <div className='Carousel'>
      <BsArrowLeftCircleFill className="arrow arrow-left" onClick={preSlide} />
      {data.map((item, idx) => {
        return <img src={item.scr} alt={item.alt} key={idx} className={slide === idx ? "slide" : "slide slide-hidden"}/>
      })
      }
      <BsArrowRightCircleFill className="arrow arrow-right"onClick={nextSlide}/>
      <span className="indicators">
        {data.map((_,idx) =>
        {
          return<button key={idx} onClick={()=>{setSlide(idx)}} className={slide === idx ? "indicator" : "indicator indicator-inactive"} ></button>
        })}
      </span>
    </div>
  )
}

export default Carousel