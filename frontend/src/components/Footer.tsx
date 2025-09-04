const Footer = (): JSX.Element => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 py-12 border-t border-gray-700/50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
              Merntix
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Empowering education through innovative technology and immersive learning experiences.
            </p>
          </div>
          <div className="border-t border-gray-700/50 pt-6">
            <p className="text-gray-500 hover:text-gray-300 transition-colors duration-300">
              &copy; {currentYear} Merntix. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 