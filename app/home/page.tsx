import Header from "@/components/Header";
import Hero from "@/components/Hero";

import StudioSection from "@/components/StudioSection";
import SolutionsSection from "@/components/SolutionsSection";
import ProcessSection from "@/components/ProcessSection";
import DealerMap from "@/components/DealerMap";
import ContactCards from "@/components/ContactCards";
import GetInTouchForm from "@/components/GetInTouchForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-dark-bg text-white selection:bg-primary-gold selection:text-white" style={{ background: '#070604', color: '#fff' }}>
      <Header />
      <Hero />
      <StudioSection />
      <GetInTouchForm />
      <SolutionsSection />
      <ProcessSection />
      {/*<DealerMap />*/}
      <ContactCards />
      <Footer />
    </main>
  );
}
