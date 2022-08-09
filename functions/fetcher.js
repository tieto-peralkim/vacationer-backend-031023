const Vacationer= require("../models/vacationer");

async function fetchVacationsBetween(start, end) {
    const all = await Vacationer.aggregate([

        // ANTAA YKSITTÄISET LOMAT ERILLISINÄ
        {
            $unwind: {
                path: "$vacations"
            }
        },
        {
            $match: {
                $and: [
                    {
                        "vacations.end": {
                            $gte: (new Date(start))
                        }
                    },
                    {
                        "vacations.start": {
                            $lte: (new Date(end))
                        }
                    }
                ]
            },
        }
        ])
    return all;
}
module.exports = fetchVacationsBetween