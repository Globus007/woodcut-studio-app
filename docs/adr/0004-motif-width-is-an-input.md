# Motif width is an input, not the first stick

Generation-1 thickness — motif width on the finished face — is a millimetre input the carpenter sets. Stick widths are only the edge-to-edge members of that panel. Inferring motif from `sticks[0].width` made mixed-width sequences emit the wrong blank and the wrong strip count. Rejected: treating every stick as a square cell.
