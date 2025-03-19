export const validateExpensesResponse = (data) => {
    const requiredFields = [
      'id', 'description', 'amount', 'date', 'member'
    ];
    
    if (!data) throw new Error('Empty response');
    if (!Array.isArray(data)) return [data]; // Handle single object response
    
    return data.map(item => {
      requiredFields.forEach(field => {
        if (!(field in item)) {
          throw new Error(`Missing required field: ${field}`);
        }
      });
      return item;
    });
  };
  
  // Usage in fetchExpenses
  import { validateExpensesResponse } from './apiValidator';
  
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/expenses`);
      const validatedData = validateExpensesResponse(response.data);
      // ... rest of processing
    } catch (error) {
      // Handle errors
    }
  }, []);