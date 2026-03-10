import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 pt-20 pb-10 transition-colors duration-500">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-russo mb-8 dark:text-white">Get In Touch</h1>
        
        <div className="flex justify-center gap-8 mb-12">
          <a href="https://www.linkedin.com/in/iste-student-s-chapter-sathyabama-191720288/" target="_blank" className="hover:scale-125 transition-transform">
            <img src={assets.linkedin} alt="LinkedIn" className="h-12" />
          </a>
          <a href="https://www.instagram.com/iste_studentchaptersist/" target="_blank" className="hover:scale-125 transition-transform">
            <img src={assets.inst} alt="Instagram" className="h-12" />
          </a>
          <a href="mailto:istestudentchaptersathyabama@gmail.com" className="hover:scale-125 transition-transform">
            <img src={assets.mail_svg} alt="Email" className="h-12" />
          </a>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-slate-500 dark:text-slate-400">
          <p>© Copyrights 2026 by ISTE SIST. All Rights Reserved.</p>
          <p className="mt-2">
            Designed and Developed by Nallakaruppannasamy R (2024-2028)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;