import Header from "../components/Header";
import Hero from "../components/Hero";
import PromptForm from "../components/PromptForm";
import Footer from "../components/Footer";

const Index = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header/>
            <main>
                <Hero/>
                <PromptForm/>
            </main>
            <Footer/>
        </div>
    );
};

export default Index;
