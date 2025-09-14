// Filename - pages/about.js

import React from "react";

const Home = () => {
    return (
        <>
      <div>
        <h1>keep the bathroom clean!</h1>
      </div>
      <h3>click "task distributer" to begin!</h3>
      <p>
        how it works: input the number of roommates, then have each roommate submit their preference ranking!
      </p>
      <p>
        the website will output optimal pairings to clean the bathroom together!
      </p>
      <p>
        if there are an odd number of roommates, it will output multiple pairings so that each roommate has the same number of pairings.
      </p>
    </>
    );
};

export default Home;