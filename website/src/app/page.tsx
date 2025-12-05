import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Pricing } from '@/components/Pricing';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';

export default function Home() {
    return (
        <>
            <Hero />
            <Features />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <FAQ />
            <CTA />
        </>
    );
}
