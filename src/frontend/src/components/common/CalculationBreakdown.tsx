import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Functions as FunctionsIcon,
} from '@mui/icons-material';
import { CalculationStep } from '@/types/money';
import { formatCurrency } from '@/utils/currency';

interface CalculationBreakdownProps {
  calculation: CalculationStep;
  variant?: 'compact' | 'detailed';
  showFormula?: boolean;
}

const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({
  calculation,
  variant = 'detailed',
  showFormula = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              {calculation.description}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', mb: 1 }}>
              {calculation.formula}
            </Typography>
            {Object.entries(calculation.values).map(([key, value]) => (
              <Typography key={key} variant="caption" sx={{ display: 'block' }}>
                {key}: {typeof value === 'number' ? formatCurrency(value * 100) : value}
              </Typography>
            ))}
          </Box>
        }
        arrow
        placement="top"
      >
        <IconButton size="small" sx={{ ml: 1 }}>
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        '&:before': { display: 'none' },
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&.Mui-expanded': {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 48,
          '&.Mui-expanded': {
            minHeight: 48,
          },
          '& .MuiAccordionSummary-content': {
            margin: '8px 0',
            alignItems: 'center',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {calculation.description}
          </Typography>
          <Chip
            label={
              typeof calculation.result === 'number' && Math.abs(calculation.result) >= 100
                ? formatCurrency(calculation.result)
                : calculation.result
            }
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {showFormula && (
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FunctionsIcon fontSize="small" color="secondary" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Formula:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: 'primary.main',
                fontWeight: 500,
              }}
            >
              {calculation.formula}
            </Typography>
          </Paper>
        )}

        {Object.keys(calculation.values).length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
              Values used in calculation:
            </Typography>
            <Table size="small">
              <TableBody>
                {Object.entries(calculation.values).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {key}:
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ border: 'none', py: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: typeof value === 'number' ? 'inherit' : 'monospace',
                          color: typeof value === 'number' ? 'success.main' : 'text.primary',
                        }}
                      >
                        {typeof value === 'number' ? formatCurrency(value * 100) : value}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default CalculationBreakdown;