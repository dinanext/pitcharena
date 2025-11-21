'use client';

import { useState, useEffect } from 'react';
import { InvestorPersona, TalkingStyle } from '@/lib/types';
import { createInvestorPersona, updateInvestorPersona } from '@/lib/admin-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface InvestorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investor?: InvestorPersona | null;
}

export function InvestorFormDialog({ isOpen, onClose, onSuccess, investor }: InvestorFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    region: '',
    language_code: 'en',
    avatar_url: '',
    risk_appetite: '',
    target_sector: '',
    check_size: '',
    investment_thesis: '',
    bluntness: 5,
    jargon_level: 'medium',
    favorite_word: '',
    humor: 5,
  });

  useEffect(() => {
    if (investor) {
      setFormData({
        name: investor.name,
        role: investor.role,
        region: investor.region,
        language_code: investor.language_code || 'en',
        avatar_url: investor.avatar_url || '',
        risk_appetite: investor.risk_appetite || '',
        target_sector: investor.target_sector || '',
        check_size: investor.check_size || '',
        investment_thesis: investor.investment_thesis,
        bluntness: investor.talking_style_json?.bluntness || 5,
        jargon_level: investor.talking_style_json?.jargon_level || 'medium',
        favorite_word: investor.talking_style_json?.favorite_word || '',
        humor: investor.talking_style_json?.humor || 5,
      });
    } else {
      setFormData({
        name: '',
        role: '',
        region: '',
        language_code: 'en',
        avatar_url: '',
        risk_appetite: '',
        target_sector: '',
        check_size: '',
        investment_thesis: '',
        bluntness: 5,
        jargon_level: 'medium',
        favorite_word: '',
        humor: 5,
      });
    }
    setError('');
  }, [investor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const talkingStyle: TalkingStyle = {
        bluntness: formData.bluntness,
        jargon_level: formData.jargon_level,
        favorite_word: formData.favorite_word,
        humor: formData.humor,
      };

      const personaData = {
        name: formData.name,
        role: formData.role,
        region: formData.region,
        language_code: formData.language_code,
        avatar_url: formData.avatar_url || null,
        risk_appetite: formData.risk_appetite,
        target_sector: formData.target_sector,
        check_size: formData.check_size,
        investment_thesis: formData.investment_thesis,
        talking_style_json: talkingStyle,
      };

      let result;
      if (investor) {
        result = await updateInvestorPersona(investor.id, personaData);
      } else {
        result = await createInvestorPersona(personaData as any);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{investor ? 'Edit Investor Persona' : 'Create Investor Persona'}</DialogTitle>
          <DialogDescription>
            {investor ? 'Update the investor persona details' : 'Add a new investor persona to the database'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., The Titan"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="e.g., USA"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language_code">Language Code</Label>
              <Input
                id="language_code"
                value={formData.language_code}
                onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
                placeholder="en"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_appetite">Risk Appetite *</Label>
            <Input
              id="risk_appetite"
              value={formData.risk_appetite}
              onChange={(e) => setFormData({ ...formData, risk_appetite: e.target.value })}
              placeholder="e.g., High Risk, High Reward"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_sector">Target Sector *</Label>
            <Input
              id="target_sector"
              value={formData.target_sector}
              onChange={(e) => setFormData({ ...formData, target_sector: e.target.value })}
              placeholder="e.g., B2B SaaS, AI Infrastructure"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="check_size">Check Size *</Label>
            <Input
              id="check_size"
              value={formData.check_size}
              onChange={(e) => setFormData({ ...formData, check_size: e.target.value })}
              placeholder="e.g., $5M - $25M"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_thesis">Investment Thesis *</Label>
            <Textarea
              id="investment_thesis"
              value={formData.investment_thesis}
              onChange={(e) => setFormData({ ...formData, investment_thesis: e.target.value })}
              placeholder="Describe the investment philosophy..."
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Talking Style</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bluntness">Bluntness (1-10)</Label>
                <Input
                  id="bluntness"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.bluntness}
                  onChange={(e) => setFormData({ ...formData, bluntness: parseInt(e.target.value) })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humor">Humor (1-10)</Label>
                <Input
                  id="humor"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.humor}
                  onChange={(e) => setFormData({ ...formData, humor: parseInt(e.target.value) })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="jargon_level">Jargon Level</Label>
                <Input
                  id="jargon_level"
                  value={formData.jargon_level}
                  onChange={(e) => setFormData({ ...formData, jargon_level: e.target.value })}
                  placeholder="low, medium, high"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favorite_word">Favorite Word</Label>
                <Input
                  id="favorite_word"
                  value={formData.favorite_word}
                  onChange={(e) => setFormData({ ...formData, favorite_word: e.target.value })}
                  placeholder="e.g., synergy"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-black">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                investor ? 'Update Investor' : 'Create Investor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
