import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Hero.css";
import RotatingText from "./RotatingText";

const teamMembers = [
  {
    name: "Joaquin Diaz",
    role: "Graphical Designer",
    image: "/assets/joaquin.jpg",
    bio: "Specializes in ideating intuitive and accessible user interfaces with figma.",
  },
  {
    name: "Stan Chen",
    role: "Full Stack Developer & Product Manager",
    image: "/assets/stan.png",
    bio: "Passionate about web development, computer vision, graphics and generative AI.",
  },
  {
    name: "Sean Donovan",
    role: "UI/UX Developer",
    image: "/assets/sean.png",
    bio: "Passionate about creating seamless user experiences and scalable applications.",
  },
  {
    name: "Sung",
    role: "Data Scientist",
    image: "/assets/sung.jpg",
    bio: "Interested in data analysis and predictive modeling, incoming Evercore analyst.",
  },
  {
    name: "Oscar Mendez",
    role: "Product Designer",
    image: "/assets/oscar.jpg",
    bio: "Interested in neuroscience, consumer psychology, and DEI.",
  },
];

import {
  FaBrain,
  FaCog,
  FaComments,
  FaShoppingBasket,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";

const features = [
  {
    title: "AI-Powered Learning",
    description:
      "Personalized study plans tailored to your learning style and goals.",
    icon: <FaBrain className="text-4xl" />,
  },
  {
    title: "Student Performance Report",
    description: "Track student progress and identify areas for improvement.",
    icon: <FaComments className="text-4xl" />,
  },
  {
    title: "Item Shop",
    description: "Shop for items to enhance your learning experience.",
    icon: <FaShoppingBasket className="text-4xl" />,
  },
];

function Hero() {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <motion.div
      className="hero-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-[#fbe3bb] hero py-12 w-full">
        {/* Hero Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {" "}
            <h1 className="text-5xl font-bold text-[#533933] mt-6 mb-6 text-center">
              Transform Your Learning Journey with{" "}
              <motion.span
                className="bg-gradient-to-r from-[#533933] to-[#977968] text-transparent bg-clip-text drop-shadow-xl underline underline-offset-8 decoration-2 decoration-[#977968] glow-text animate-underline-pulse"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                NeuraBlend
              </motion.span>{" "}
              AI
            </h1>
            <p className="herotext text-xl text-[#977968] max-w-2xl mx-auto">
              Experience personalized education powered by cutting-edge
              artificial intelligence.
            </p>
            <div className="herobutton">
              <RotatingText
                texts={[
                  "Get Started",
                  "Join Now",
                  "Start Learning",
                  "Explore AI",
                ]}
                onClick={() => {
                  window.location.href = "/register";
                }}
                mainClassName="rotating px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 bg-[#fbe3bb] text-[#533933] hover:bg-[#977968]/20 transition-colors rounded-lg font-semibold text-lg justify-center"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2.3 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#533933] mt-10 mb-6">
                Our Features
              </h2>
              <p className="text-[#977968] text-lg max-w-3xl mx-auto mb-8">
                Experience the power of AI-driven learning with our innovative
                features.
              </p>
            </div>
            <div className="grid feat md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-10 rounded-lg shadow-lg"
                >
                  <div className="mb-4 flex flex-col items-center">
                    <motion.div
                      className="text-[#533933] mb-2"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-semibold text-[#533933]">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-[#977968] text-center">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2.3 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-[#533933] text-center mb-8">
                Meet Our Team
              </h2>
              <div className="team-section">
                <div className="team-list">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#fbe3bb]">
                        <th className="py-4 text-left text-[#533933]">Name</th>
                        <th className="py-4 text-left text-[#533933]">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, index) => (
                        <motion.tr
                          key={index}
                          className="cursor-pointer hover:bg-[#fbe3bb]/10"
                          onHoverStart={() => setSelectedMember(member)}
                          whileHover={{ scale: 1.01 }}
                          onHoverEnd={() => setSelectedMember(null)}
                        >
                          <td className="py-4 text-[#977968]">{member.name}</td>
                          <td className="py-4 text-[#977968]">{member.role}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Team Member Details */}
                {selectedMember && (
                  <div className={`team-member-details visible`}>
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="team-member-image"
                    />
                    <h3 className="text-xl font-semibold text-[#533933] mb-2">
                      {selectedMember.name}
                    </h3>
                    <p className="text-[#977968] mb-4">{selectedMember.role}</p>
                    <p className="text-[#977968] text-sm">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Hero;
