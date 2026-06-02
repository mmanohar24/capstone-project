const express = require('express');
const router = express.Router();

router.post('/decode', async (req, res) => {

    try {
        const { VIN } = req.body;

        if (VIN && VIN.length === 17) {
            const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${VIN}?format=json`);
            const result = await response.json();
            console.log(result.Results.find(item => item.Variable === "Error Code"));

            const errorCode = result.Results.find(item => item.Variable === "Error Code").Value;

            if (errorCode !== "0") {
                return res.status(400).json({ message: "Please enter a correct VIN" });
            }
            else {
                const make = result.Results.find(item => item.Variable === "Make")?.Value;
                const model = result.Results.find(item => item.Variable === "Model")?.Value;
                const modelYear = result.Results.find(item => item.Variable === "Model Year")?.Value;
                const trim = result.Results.find(item => item.Variable === "Trim")?.Value;
                const vehicleType = result.Results.find(item => item.Variable === "Vehicle Type")?.Value;
                const bodyClass = result.Results.find(item => item.Variable === "Body Class")?.Value;

                return res.json(
                    {
                        make,
                        model,
                        modelYear,
                        trim,
                        vehicleType,
                        bodyClass
                    });
            }
        }
        else {
            return res.status(400).json({ message: "VIN is missing or please check the length of VIN. VIN should be 17 characters" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" })
    }
})

module.exports = router;