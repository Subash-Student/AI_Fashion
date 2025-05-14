import React, { useContext,useEffect } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';
import { ShopContext } from '../context/ShopContext';
import { getAboutPageSummary, textToSpeech } from '../utils/voiceContent';

const About = () => {

    const { setPageValues } = useContext(ShopContext);


    useEffect(() => {
     
        const speechText = getAboutPageSummary();

        textToSpeech(speechText)

        setPageValues({ currentPage: "about", pageContent: speechText })

    }, [])

    return (
        <div>
            <div className='text-2xl text-center pt-8 border-t'>
                <Title text1={'ABOUT'} text2={'US'} />
            </div>


            <div className='my-10 flex flex-col md:flex-row gap-16'>
                <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
                <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
                    <b >FeelWays was born out of a passion for innovation and a commitment to inclusivity, aiming to revolutionize how visually impaired individuals experience online shopping.</b>
                    <p>Our journey began with a clear vision: to create a voice-powered, AI-enabled platform where users can independently explore and purchase fashion items with ease and confidence.

                        Since our inception, we've focused on curating a stylish and accessible collection of dresses, enriched with detailed, voice-readable descriptions powered by AI. By combining fashion with cutting-edge technology, we ensure that every user—regardless of visual ability—can enjoy a seamless and empowering shopping experience.</p>
                    <b className='text-gray-800'>Our Mission</b>
                    <p>At FeelWays, our mission is to make online shopping inclusive, intuitive, and intelligent. We are dedicated to enabling independence through voice interaction, haptic feedback, and smart AI assistance—bringing choice, convenience, and confidence to every step of the journey.

                    </p>
                </div>
            </div>
            <div className='flex flex-col md:flex-row text-sm mb-20'>
                {[
                    { title: "Quality Assurance:", description: "We meticulously select and vet each product to ensure it meets our stringent quality standards." },
                    { title: "Convenience:", description: "With our user-friendly interface and hassle-free ordering process, shopping has never been easier." },
                    { title: "Exceptional Customer Service:", description: "Our team of dedicated professionals is here to assist you, ensuring your satisfaction is our top priority." }
                ].map((item, index) => (
                    <div key={index} className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
                        <b>{item.title}</b>
                        <p className='text-gray-600'>{item.description}</p>
                    </div>
                ))}
            </div>
            {/* <NewsletterBox /> */}
        </div>
    );
};

export default About;
