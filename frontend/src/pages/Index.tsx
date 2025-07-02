import Header from "../components/Header";
import Hero from "../components/Hero";
import PromptForm from "../components/PromptForm";
import Footer from "../components/Footer";
import FlowDiagram from "../components/FlowDiagram";

const Index = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main>
                <Hero />
                <PromptForm />
                {!isMobile && (
                    <section className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
                        <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] max-w-6xl mx-auto">
                            <FlowDiagram />
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Index;
