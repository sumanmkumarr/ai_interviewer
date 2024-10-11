const Candidate = require('../Models/candidate');

// Controller to handle storing candidate information
storeCandidate = async (req, res) => {
  const { candidate_name } = req.body;

  if (!candidate_name) {
    return res.status(400).json({ error: 'Candidate name is required' });
  }

  try {
    // Check if candidate already exists in the database
    let candidate = await Candidate.findOne({ name: candidate_name });
    
    // If not found, create a new candidate record
    if (!candidate) {
      candidate = new Candidate({ name: candidate_name });
      await candidate.save();
    }

    res.json({ message: 'Candidate stored successfully', candidate });
  } catch (error) {
    console.error('Error storing candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to update interview data for a candidate
updateInterviewData = async (req, res) => {
  const { candidate_name, question, response } = req.body;

  if (!candidate_name || !question || !response) {
    return res.status(400).json({ error: 'Candidate name, question, and response are required' });
  }

  try {
    // Find the candidate by name
    let candidate = await Candidate.findOne({ name: candidate_name });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update interview data and questions asked count
    candidate.interview_data.push({ question, response });
    candidate.questions_asked += 1;

    // Save the updated candidate data
    await candidate.save();

    res.json({ message: 'Interview data updated successfully', candidate });
  } catch (error) {
    console.error('Error updating interview data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const saveInterviewData = async (req, res) => {
  const { candidateName, question, response } = req.body;

  // Check if all required fields are present
  if (!candidateName || !question || !response) {
    return res.status(400).json({ error: 'All fields are required: candidateName, question, response' });
  }

  try {
    const updatedCandidate = await Candidate.findOneAndUpdate(
      { name: candidateName },
      { $push: { interview_data: { question, response } }, $inc: { questions_asked: 1 } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Interview data saved successfully', data: updatedCandidate });
  } catch (error) {
    console.error('Error saving interview data:', error);
    res.status(500).json({ error: 'Failed to save interview data' });
  }
};

module.exports = { 
  saveInterviewData,
  storeCandidate,
  updateInterviewData
};