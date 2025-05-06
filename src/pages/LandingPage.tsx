import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Building, Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { calendars } from '../data/mockData';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Scheduling Made Simple for Your Business
              </h1>
              <p className="text-lg md:text-xl mb-8 text-primary-100">
                Streamline appointments for barbershops, beauty clinics, dental offices, and more with our intuitive scheduling platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-primary-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end animate-fade-in">
              <img
                src="https://images.pexels.com/photos/7129744/pexels-photo-7129744.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Calendar Scheduling"
                className="rounded-lg shadow-xl max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Scheduling Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to efficiently manage appointments and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Calendars</h3>
                <p className="text-gray-600">
                  Manage multiple locations or departments from a single dashboard with separate calendars for each.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Management</h3>
                <p className="text-gray-600">
                  Assign professionals to specialties and manage their availability and schedules with ease.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
                <p className="text-gray-600">
                  Customize appointment durations, buffer times, and working hours for each service.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="bg-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Service Specialties</h3>
                <p className="text-gray-600">
                  Create and manage different service types with specific durations and pricing options.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="bg-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Client Self-Service</h3>
                <p className="text-gray-600">
                  Empower clients to book, reschedule, or cancel appointments without calling your business.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="bg-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-secondary-600">
                    <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"></path>
                    <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"></path>
                    <path d="M10 10a4.2 4.2 0 0 1-1.7.7"></path>
                    <path d="M14 21v1"></path>
                    <path d="M10 21v1"></path>
                    <path d="M22 19l-1 1"></path>
                    <path d="M16 13v2"></path>
                    <path d="M20 13v2"></path>
                    <path d="M12 21a9 9 0 0 0 9-9"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Appointment Reminders</h3>
                <p className="text-gray-600">
                  Reduce no-shows with automated appointment confirmations and reminders for clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calendars Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Calendars</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book an appointment with one of our featured businesses below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calendars.map((calendar) => (
              <Card key={calendar.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <div 
                      className="h-48 bg-gray-300 bg-cover bg-center"
                      style={{
                        backgroundImage: calendar.id === '1' 
                          ? 'url(https://images.pexels.com/photos/3356170/pexels-photo-3356170.jpeg?auto=compress&cs=tinysrgb&w=600)'
                          : 'url(https://images.pexels.com/photos/3735810/pexels-photo-3735810.jpeg?auto=compress&cs=tinysrgb&w=600)'
                      }}
                    ></div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{calendar.name}</h3>
                      <p className="text-gray-600 mb-4">
                        {calendar.id === '1' 
                          ? 'Professional haircut and styling services for men.'
                          : 'Comprehensive medical and aesthetic treatments.'}
                      </p>
                      <Link to={`/booking/${calendar.id}`}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between"
                          rightIcon={<ArrowRight size={16} />}
                        >
                          Book an Appointment
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Businesses love how AppointEase simplifies their scheduling workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="bg-primary-50 border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "AppointEase has transformed how we manage our barbershop. Our clients love the easy online booking, and we've reduced no-shows by 60%."
                </p>
                <div className="flex items-center">
                  <div className="mr-3">
                    <img 
                      src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Customer" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Wilson</p>
                    <p className="text-sm text-gray-600">Owner, Downtown Cuts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-primary-50 border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "The multi-calendar feature is perfect for our clinic with multiple specialists. We can manage all appointments in one place while keeping schedules separate."
                </p>
                <div className="flex items-center">
                  <div className="mr-3">
                    <img 
                      src="https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Customer" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Jennifer Lopez</p>
                    <p className="text-sm text-gray-600">Medical Director, Wellness Clinic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-primary-50 border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "As a small beauty salon, AppointEase has helped us look professional and provide a seamless booking experience. Our clients love it!"
                </p>
                <div className="flex items-center">
                  <div className="mr-3">
                    <img 
                      src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Customer" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Thompson</p>
                    <p className="text-sm text-gray-600">Owner, Glow Beauty Bar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-600 to-secondary-800 text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your scheduling?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-secondary-100">
            Join thousands of businesses that use AppointEase to streamline their appointment booking process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-secondary-700 hover:bg-gray-100 w-full sm:w-auto">
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/calendars">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-secondary-700 w-full sm:w-auto">
                View Demo Calendars
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;