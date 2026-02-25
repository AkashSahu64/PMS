// pages/SearchResults.jsx
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import API from '../store/authStore';

const fetchPatients = async (search) => {
  if (!search) return { patients: [] };
  const { data } = await API.get('/patients', { params: { search, limit: 20 } });
  return data;
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchPatients(query),
    enabled: !!query
  });

  if (!query) {
    return <div className="text-center py-12">Enter a search term</div>;
  }

  if (isLoading) {
    return <div className="text-center py-12">Searching...</div>;
  }

  const patients = data?.patients || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Results for "{query}"</h1>
      {patients.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl text-center">
          <p className="text-gray-600 mb-4">No patients found</p>
          <Link
            to="/patients/register"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700"
          >
            Register New Patient
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <motion.div
              key={patient._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
            >
              <Link to={`/patients/${patient._id}`} className="block hover:bg-gray-50 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{patient.name}</h3>
                    <p className="text-gray-600">ID: {patient.patientId}</p>
                    <p className="text-gray-600">Mobile: {patient.mobile}</p>
                  </div>
                  <span className="text-primary-600">View Profile →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;