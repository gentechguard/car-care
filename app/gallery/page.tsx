import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryHero from "@/app/sections/GalleryHero";
import GalleryGrid from "@/app/sections/GalleryGrid";

export const metadata = {
    title: "Gallery | Gentech Car Care",
    description:
        "Browse our portfolio of premium paint protection installations, product showcases, and industry events.",
};

export default function GalleryPage() {
    return (
        <main
            className="min-h-[100dvh] bg-dark-bg text-white selection:bg-primary-gold selection:text-white"
            style={{ background: "#070604", color: "#fff" }}
        >
            <Header />
            <GalleryHero />
            <GalleryGrid />
            <Footer />
        </main>
    );
}
