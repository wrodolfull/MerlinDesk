import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for personal use',
      price: 0,
      features: [
        '1 calendar',
        '1 professional',
        '50 appointments per month',
        'Basic email notifications',
        'Standard support',
      ],
      limitations: [
        'No analytics',
        'No custom branding',
        'No SMS notifications',
      ],
    },
    {
      name: 'Business',
      description: 'For growing businesses',
      price: 29.99,
      features: [
        'Unlimited calendars',
        'Unlimited professionals',
        'Unlimited appointments',
        'Advanced analytics',
        'Custom branding',
        'Email & SMS notifications',
        'Priority support',
        'API access',
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-primary-500 shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-gray-600 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.limitations && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-center text-gray-500 py-1">
                          <span className="h-5 w-5 mr-3 flex-shrink-0">✕</span>
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  <Link to="/register">
                    <Button
                      className={`w-full ${
                        plan.popular ? '' : 'bg-gray-800 hover:bg-gray-900'
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated amount for the remainder of your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-600">
                After your trial ends, you'll automatically be moved to the Free plan unless you choose to upgrade to the Business plan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a long-term contract?
              </h3>
              <p className="text-gray-600">
                No, all plans are month-to-month and you can cancel at any time without penalty.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer custom plans?
              </h3>
              <p className="text-gray-600">
                Yes, if you need custom features or have specific requirements, please contact our sales team for a custom solution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;