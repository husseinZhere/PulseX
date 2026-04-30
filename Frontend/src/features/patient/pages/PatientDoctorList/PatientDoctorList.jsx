import React, { useEffect, useMemo, useState } from 'react';
import DoctorFilters from '../../components/DoctorList/DoctorFilters';
import DoctorGrid from '../../components/DoctorList/DoctorGrid';
import DoctorListHeader from '../../components/DoctorList/DoctorListHeader';
import DoctorListStats from '../../components/DoctorList/DoctorListStats';
import DoctorPagination from '../../components/DoctorList/DoctorPagination';
import { listDoctors } from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';

const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: '$0–$100', min: 0, max: 100 },
  { label: '$100–$200', min: 100, max: 200 },
  { label: '$200+', min: 200, max: Infinity },
];
const PER_PAGE = 6;

const mapDoctor = (d) => ({
  id: d.id,
  name: d.fullName || d.name || 'Doctor',
  loc: d.clinicLocation || d.location || '',
  rate: Math.round(d.averageRating ?? d.rate ?? 0),
  reviews: d.totalRatings ?? d.reviews ?? 0,
  price: Number(d.consultationPrice ?? d.price ?? 0),
  img: resolveFileUrl(d.profilePicture || ''),
});

const PatientDoctorList = () => {
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [rating, setRating] = useState('all');

  useEffect(() => {
    document.title = 'Doctor List | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Browse and book appointments with heart specialists.');
    }
  }, []);

  const [stats, setStats] = useState({ totalDoctors: 0, topRated: '0%', activeNow: 0 });

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await listDoctors({ pageSize: 100 });
        const list = Array.isArray(resp)
          ? resp
          : (resp?.doctors || resp?.items || resp?.data || []);
          
        if (!ignore) {
          setAllDoctors(list.map(mapDoctor));
          
          if (resp?.statistics) {
            const topRatedPct = resp.statistics.totalDoctors > 0
              ? Math.round((resp.statistics.topRatedDoctors / resp.statistics.totalDoctors) * 100) + '%'
              : '0%';
            setStats({
              totalDoctors: resp.statistics.totalDoctors,
              topRated: topRatedPct,
              activeNow: resp.statistics.activeNow
            });
          } else {
             // Fallback if statistics object isn't perfectly mapped
             setStats(prev => ({ ...prev, totalDoctors: list.length }));
          }
        }
      } catch (err) {
        console.error('Load doctors failed', err);
        if (!ignore) setAllDoctors([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const LOCATIONS = useMemo(
    () => ['All', ...Array.from(new Set(allDoctors.map((d) => d.loc).filter(Boolean)))],
    [allDoctors]
  );

  const filtered = useMemo(() => {
    const pr = PRICE_RANGES[priceRange];
    return allDoctors.filter((d) => {
      const matchName = d.name.toLowerCase().includes(search.toLowerCase());
      const matchLoc = location === 'All' || d.loc === location;
      const matchPrice = d.price >= pr.min && d.price < pr.max;
      const matchRate = rating === 'all' || d.rate >= parseInt(rating, 10);
      return matchName && matchLoc && matchPrice && matchRate;
    });
  }, [allDoctors, search, location, priceRange, rating]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 4);

  return (
    <main className="min-h-screen p-6 sm:p-[24px]">
      <DoctorListHeader />

      <DoctorListStats 
        totalDoctors={stats.totalDoctors} 
        topRated={stats.topRated} 
        activeNow={stats.activeNow} 
      />

      <DoctorFilters
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        rating={rating}
        onRatingChange={(value) => { setRating(value); setPage(1); }}
        location={location}
        onLocationChange={(value) => { setLocation(value); setPage(1); }}
        priceRange={priceRange}
        onPriceRangeChange={(value) => { setPriceRange(value); setPage(1); }}
        locations={LOCATIONS}
        priceRanges={PRICE_RANGES}
      />

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading doctors…</div>
      ) : (
        <>
          <DoctorGrid doctors={visible} />
          <DoctorPagination
            safePage={safePage}
            totalPages={totalPages}
            pageNums={pageNums}
            onGoTo={goTo}
          />
        </>
      )}

      <footer className="sr-only">
        <p>End of doctor list page.</p>
      </footer>
    </main>
  );
};

export default PatientDoctorList;
