-- Migration: Update existing deployments from claude-opus-4.5 to minimax-m2.5
UPDATE deployments SET model = 'minimax-m2.5' WHERE model = 'claude-opus-4.5';
