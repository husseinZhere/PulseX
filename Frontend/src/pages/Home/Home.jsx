import React from 'react';
import SectionWrapper from '../../components/SectionWrapper/SectionWrapper';
import Hero from '../../components/Hero/Hero';
// استدعاء السكاشن (بدون استدعاء Home داخل نفسه!)
import Features from '../../components/Features/Features';
import Doctors from '../../components/Doctors/Doctors';
import Stories from '../../components/Stories/Stories';
import About from '../../components/JourneyTimeline/JourneyTimeline';
// import { Navbar } from 'flowbite-react';
import Navbar from './../../components/Navbar/Navbar';


const Home = () => {
  return (
    <main className="overflow-hidden">

      <section id="home" >
         < Hero/>
      </section>
   <SectionWrapper  id="doctors">
        <Doctors />
      </SectionWrapper>
      <SectionWrapper id="features">
        <Features />
      </SectionWrapper>

   
      <SectionWrapper id="stories" >
       
       <Stories />
      </SectionWrapper>

         <SectionWrapper id="about" >
       
       <About/>
      </SectionWrapper>
    </main>
  );
};

export default Home;