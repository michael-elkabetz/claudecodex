import Header from "../components/Header";
import Hero from "../components/Hero";
import PromptForm from "../components/PromptForm";
import Footer from "../components/Footer";
import FlowDiagram from "../components/FlowDiagram";

const Index = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main>
                <Hero />
                <PromptForm />
                <FlowDiagram />
            </main>
            <Footer />
        </div>
    );
};

export default Index;
