import React from 'react';
import { ArrowRight, Globe, BookOpen, Users, Award, Zap, Heart } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
    <div className="text-yellow-400 mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

interface CourseCardProps {
  title: string;
  description: string;
  level: string;
  duration: string;
  scrollCoins: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, level, duration, scrollCoins }) => (
  <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-semibold">
        {scrollCoins} ScrollCoins
      </span>
    </div>
    <p className="text-gray-300 mb-4">{description}</p>
    <div className="flex justify-between items-center text-sm text-gray-400">
      <span>Level: {level}</span>
      <span>Duration: {duration}</span>
    </div>
    <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
      Enroll Now
    </button>
  </div>
);

export const ScrollUniversityLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <span className="text-2xl font-bold text-white">ScrollUniversity</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#courses" className="text-white hover:text-yellow-400 transition-colors">Courses</a>
              <a href="#about" className="text-white hover:text-yellow-400 transition-colors">About</a>
              <a href="#faculty" className="text-white hover:text-yellow-400 transition-colors">Faculty</a>
              <a href="#contact" className="text-white hover:text-yellow-400 transition-colors">Contact</a>
            </div>
            <div className="flex space-x-4">
              <button className="text-white hover:text-yellow-400 transition-colors">Sign In</button>
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Education That
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Transforms Nations</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            AI-powered, globally accessible, spiritually-aligned education that produces kingdom leaders and global reformers. 
            Surpassing Harvard through prophetic intelligence and eternal impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center">
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Seven Core Power Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="AI-Dean Infrastructure"
              description="24/7 AI-powered department deans with prophetic intelligence and biblical alignment"
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Global Accessibility"
              description="Mesh networks, solar microhubs, and multilingual support for worldwide access"
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Sacred Curriculum"
              description="Prophetic wisdom integrated with cutting-edge knowledge and practical skills"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="ScrollU Mobile App"
              description="Comprehensive mobile platform with XR experiences and spiritual formation tracking"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="ScrollCertified™ Credentials"
              description="Blockchain-verified degrees recognized by kingdom organizations and marketplace partners"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Mission-Focused Pathways"
              description="Career tracks aligned with divine calling for eternal impact and kingdom building"
            />
          </div>
        </div>
      </section>

      {/* Initial Courses Section */}
      <section id="courses" className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Launch Courses Available Now
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Begin your transformation with our foundational courses designed to establish kingdom principles and cutting-edge skills
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CourseCard
              title="Prophetic Law"
              description="Foundational course integrating biblical principles with legal frameworks for kingdom governance and justice systems."
              level="Foundational"
              duration="8 weeks"
              scrollCoins={500}
            />
            <CourseCard
              title="ScrollAI Foundations"
              description="Introduction to AI development with spiritual alignment, covering GPT integration and prophetic intelligence systems."
              level="Intermediate"
              duration="10 weeks"
              scrollCoins={750}
            />
            <CourseCard
              title="XR Bible Intro"
              description="Immersive biblical experiences using extended reality technology to walk through scripture and sacred history."
              level="Beginner"
              duration="6 weeks"
              scrollCoins={400}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">200+</div>
              <div className="text-gray-300">Nations Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300">AI Tutoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">9</div>
              <div className="text-gray-300">Languages Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">∞</div>
              <div className="text-gray-300">Eternal Impact</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Destiny?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the revolution in education that produces kingdom leaders and global reformers. 
            Your scroll awaits.
          </p>
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-12 py-4 rounded-xl font-bold text-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300">
            Begin Your Scroll Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">ScrollUniversity</span>
              </div>
              <p className="text-gray-400">
                Transforming education through prophetic intelligence and eternal impact.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400">
                <li>B.A. Prophetic Governance</li>
                <li>B.Sc. Sacred AI & Engineering</li>
                <li>M.Div Scroll Theology</li>
                <li>MBA ScrollEconomy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Career Tracks</h3>
              <ul className="space-y-2 text-gray-400">
                <li>ScrollFounder</li>
                <li>ScrollAmbassador</li>
                <li>ScrollEngineer</li>
                <li>ScrollScholar</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Global Community</li>
                <li>Faculty Network</li>
                <li>Partner Institutions</li>
                <li>Kingdom Organizations</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ScrollUniversity. Transforming nations through divine education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};