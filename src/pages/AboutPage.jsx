
import React from 'react';
import { Helmet } from 'react-helmet';
import { Target, Heart, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPageMeta } from '@/lib/meta';

const AboutPage = () => {
  const meta = getPageMeta('about');
  
  const values = [
    {
      icon: Target,
      title: 'Notre Mission',
      description: 'Rendre les meilleures tendances accessibles à tous les Sénégalais avec des prix compétitifs et un service de qualité.',
    },
    {
      icon: Heart,
      title: 'Notre Passion',
      description: 'Nous aimons ce que nous faisons et nous nous engageons à satisfaire chaque client avec des produits authentiques.',
    },
    {
      icon: Award,
      title: 'Qualité Garantie',
      description: 'Tous nos produits sont soigneusement sélectionnés et vérifiés pour garantir votre satisfaction.',
    },
    {
      icon: Users,
      title: 'Proximité Client',
      description: "Notre équipe est disponible pour vous accompagner à chaque étape de votre expérience d'achat.",
    },
  ];
  
  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#C9A84C] to-[#8B7635] text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                À Propos de Philia'Store
              </h1>
              <p className="text-xl opacity-90">
                Votre boutique en ligne de confiance au Sénégal depuis 2020
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="prose prose-lg max-w-none"
              >
                <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Notre Histoire
                </h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  Philia'Store est née d'une passion pour la mode, la beauté et l'innovation. Fondée en 2020 à Dakar, 
                  notre boutique en ligne s'est rapidement imposée comme une référence pour les Sénégalais en quête 
                  de produits tendance à des prix accessibles.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  Nous croyons que chaque Sénégalais mérite d'accéder aux meilleures tendances mondiales sans 
                  compromis sur la qualité ou le prix. C'est pourquoi nous travaillons sans relâche pour vous 
                  offrir une sélection soigneusement choisie de produits dans les domaines de la mode, la beauté, 
                  la technologie, la maison, les jouets et le sport.
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Aujourd'hui, avec plus de 5000 clients satisfaits et une présence dans les 14 régions du Sénégal, 
                  Philia'Store continue de grandir tout en restant fidèle à ses valeurs : qualité, accessibilité 
                  et service client exceptionnel.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Nos Valeurs
              </h2>
              <p className="text-gray-600 text-lg">Ce qui nous guide au quotidien</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-16 h-16 bg-[#C9A84C] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-[#C9A84C]" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '5000+', label: 'Clients Satisfaits' },
                { value: '500+', label: 'Produits' },
                { value: '14', label: 'Régions Couvertes' },
                { value: '4.9/5', label: 'Note Moyenne' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-[#C9A84C] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Notre Équipe
              </h2>
              <p className="text-gray-600 text-lg">Des passionnés à votre service</p>
            </div>
            
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-gray-700 text-lg leading-relaxed">
                Notre équipe dévouée travaille chaque jour pour vous offrir la meilleure expérience d'achat en ligne. 
                Du service client à la logistique, en passant par la sélection des produits, chaque membre de Philia'Store 
                partage la même passion : votre satisfaction.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
