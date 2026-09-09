export default async function handler(req, res) {

    if(req.method !== "GET"){
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const reference = req.query.reference;

    if(!reference){
        return res.status(400).json({
            success: false,
            message: "Payment reference is required"
        });
    }

    try{

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const data = await response.json();

        if(
            !response.ok ||
            !data.status ||
            !data.data ||
            data.data.status !== "success"
        ){
            return res.status(400).json({
                success: false,
                message: "Payment could not be verified"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            reference: data.data.reference,
            amount: data.data.amount,
            currency: data.data.currency
        });

    }catch(error){

        console.error("Paystack verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while verifying payment"
        });
    }
}
