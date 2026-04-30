import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CustomSlider = ({ data, renderItem, paginationType = "bullets" }) => {
  return (
    <div className={`relative w-full ${paginationType === 'rect' ? 'rect-pagination' : ''}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        className="pb-16"
      >
        {data.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-disabled { display: none !important; }
        .swiper-button-next, .swiper-button-prev {
          background: white; width: 50px; height: 50px; border-radius: 50%;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05); color: #333CF5 !important;
        }
        .swiper-button-next::after, .swiper-button-prev::after { font-size: 18px; font-weight: bold; }
        
        /* Pagination Rectangles */
        .rect-pagination .swiper-pagination-bullet {
          width: 35px; height: 6px; border-radius: 4px; transition: all 0.3s;
        }
        .rect-pagination .swiper-pagination-bullet-active {
          width: 55px; background: #333CF5 !important;
        }
      `}</style>
    </div>
  );
};

export default CustomSlider;