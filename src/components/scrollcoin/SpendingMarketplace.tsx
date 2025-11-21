/**
 * Spending Marketplace Component
 * Displays items and services that can be purchased with ScrollCoin
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Crown,
  Heart,
  Search,
  ShoppingCart,
  Tag
} from 'lucide-react';
import { SpendingOption } from '@/types/scrollcoin';

interface SpendingMarketplaceProps {
  currentBalance: number;
}

const SpendingMarketplace: React.FC<SpendingMarketplaceProps> = ({ currentBalance }) => {
  const [options, setOptions] = useState<SpendingOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<SpendingOption[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In production, this would fetch from API
    const mockOptions: SpendingOption[] = [
      {
        id: '1',
        title: 'Advanced Theology Course',
        description: 'Deep dive into systematic theology and biblical interpretation',
        cost: 500,
        category: 'COURSE',
        imageUrl: '/course-theology.jpg',
        available: true,
        actionUrl: '/courses/advanced-theology'
      },
      {
        id: '2',
        title: 'Premium Study Materials',
        description: 'Access exclusive study guides, notes, and resources',
        cost: 150,
        category: 'RESOURCE',
        imageUrl: '/resources-premium.jpg',
        available: true,
        discount: 20,
        actionUrl: '/resources/premium'
      },
      {
        id: '3',
        title: 'Ministry Certification',
        description: 'Official certification for ministry leadership',
        cost: 1000,
        category: 'CERTIFICATION',
        imageUrl: '/cert-ministry.jpg',
        available: true,
        actionUrl: '/certifications/ministry'
      },
      {
        id: '4',
        title: 'Premium Membership (1 Month)',
        description: 'Unlock all premium features and exclusive content',
        cost: 300,
        category: 'PREMIUM',
        imageUrl: '/premium-membership.jpg',
        available: true,
        actionUrl: '/premium/subscribe'
      },
      {
        id: '5',
        title: 'Support a Missionary',
        description: 'Donate to support missionaries in the field',
        cost: 100,
        category: 'DONATION',
        imageUrl: '/donation-missionary.jpg',
        available: true,
        actionUrl: '/donate/missionary'
      },
      {
        id: '6',
        title: 'Biblical Languages Course',
        description: 'Learn Hebrew and Greek for biblical study',
        cost: 750,
        category: 'COURSE',
        imageUrl: '/course-languages.jpg',
        available: true,
        actionUrl: '/courses/biblical-languages'
      },
      {
        id: '7',
        title: 'AI Tutor Premium Access',
        description: 'Unlimited access to AI tutoring and personalized learning',
        cost: 200,
        category: 'PREMIUM',
        imageUrl: '/ai-tutor-premium.jpg',
        available: true,
        discount: 15,
        actionUrl: '/ai-tutor/premium'
      },
      {
        id: '8',
        title: 'Scholarship Fund Donation',
        description: 'Help students in need access quality education',
        cost: 250,
        category: 'DONATION',
        imageUrl: '/donation-scholarship.jpg',
        available: true,
        actionUrl: '/donate/scholarship'
      }
    ];

    setOptions(mockOptions);
    setFilteredOptions(mockOptions);
  }, []);

  useEffect(() => {
    let filtered = options;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(opt => opt.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(opt =>
        opt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOptions(filtered);
  }, [categoryFilter, searchTerm, options]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'COURSE':
        return <BookOpen className="h-5 w-5" />;
      case 'RESOURCE':
        return <FileText className="h-5 w-5" />;
      case 'CERTIFICATION':
        return <Award className="h-5 w-5" />;
      case 'PREMIUM':
        return <Crown className="h-5 w-5" />;
      case 'DONATION':
        return <Heart className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'COURSE':
        return 'bg-blue-100 text-blue-800';
      case 'RESOURCE':
        return 'bg-purple-100 text-purple-800';
      case 'CERTIFICATION':
        return 'bg-green-100 text-green-800';
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONATION':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canAfford = (cost: number) => currentBalance >= cost;

  const getFinalCost = (option: SpendingOption) => {
    if (option.discount) {
      return option.cost * (1 - option.discount / 100);
    }
    return option.cost;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>ScrollCoin Marketplace</CardTitle>
          <CardDescription>
            Use your ScrollCoin to access courses, resources, and support kingdom initiatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Balance Display */}
          <div className="bg-primary/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold text-primary">{currentBalance.toFixed(2)} SC</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search marketplace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="COURSE">Courses</SelectItem>
                <SelectItem value="RESOURCE">Resources</SelectItem>
                <SelectItem value="CERTIFICATION">Certifications</SelectItem>
                <SelectItem value="PREMIUM">Premium Features</SelectItem>
                <SelectItem value="DONATION">Donations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marketplace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOptions.map((option) => {
              const finalCost = getFinalCost(option);
              const affordable = canAfford(finalCost);

              return (
                <Card key={option.id} className={`hover:shadow-lg transition-shadow ${!affordable ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-6">
                    {/* Image Placeholder */}
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-primary">
                        {getIcon(option.category)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm">{option.title}</h3>
                          {option.discount && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              -{option.discount}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {option.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(option.category)}>
                          {option.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {option.discount ? (
                            <div>
                              <p className="text-xs text-muted-foreground line-through">
                                {option.cost} SC
                              </p>
                              <p className="text-lg font-bold text-primary">
                                {finalCost.toFixed(2)} SC
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-primary">
                              {finalCost.toFixed(2)} SC
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          disabled={!affordable || !option.available}
                          onClick={() => window.location.href = option.actionUrl}
                        >
                          {!affordable ? 'Insufficient Balance' : 'Purchase'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredOptions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpendingMarketplace;
